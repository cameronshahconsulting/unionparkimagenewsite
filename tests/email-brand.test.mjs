import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';

const hooks = registerHooks({resolve(specifier, context, next) {
  if (context.parentURL?.includes('/lib/')) {
    const stubs = {
      './supabase': 'export const supabaseConfigured=false; export const supabaseAdmin=()=>{throw new Error("No database in this test")};',
      './designs': 'export const loadDesignPlan=async()=>null;',
    };
    if(stubs[specifier]) return {url:'data:text/javascript,'+encodeURIComponent(stubs[specifier]),shortCircuit:true};
    if(specifier==='./site'||specifier==='@/lib/site') return {url:new URL('../lib/site.ts',import.meta.url).href,shortCircuit:true};
    if(['./email-brand','./resend','./team-notify','./site-config'].includes(specifier)) return {url:new URL('../lib/'+specifier.slice(2)+'.js',import.meta.url).href,shortCircuit:true};
  }
  return next(specifier,context);
}});
const { unionParkSender, unionParkSubject } = await import('../lib/email-brand.js');
const { sendDesignReadyEmail, notifyTeamDesignReady } = await import('../lib/design-email.js');
const { renderTeamEmail, renderCustomerEmail } = await import('../lib/email.ts');
const originalFetch = globalThis.fetch;
const sent=[];
process.env.RESEND_API_KEY='fixture-not-a-key';
process.env.LEAD_EMAIL_FROM="Annie's <notifications@verified.example.com>";
process.env.RESEND_FROM_EMAIL="Annie's <other@verified.example.com>";
process.env.LEAD_EMAIL_TO='upl-team@example.com';
process.env.CONTACT_TO_EMAIL='nursery-team@example.com';
process.env.NEXT_PUBLIC_SITE_URL='https://annies.example.com';
globalThis.fetch=async(url,options)=>{
  assert.equal(url,'https://api.resend.com/emails');
  sent.push(JSON.parse(options.body));
  return Response.json({id:'fixture'});
};

test('sender uses the configured verified mailbox with the Union Park display name',()=>{
  assert.equal(unionParkSender(),'Union Park Landscaping <notifications@verified.example.com>');
  assert.equal(unionParkSubject("[Annie's] New design"),'[Union Park Landscaping] New design');
  assert.equal(unionParkSubject('[Union Park Landscaping] New design'),'[Union Park Landscaping] New design');
});
test('saved-design email sends Union Park identity and a public Union Park permalink',async()=>{
  const result=await sendDesignReadyEmail({email:'qa@example.com',designId:'test-design',plan:{items:[]}});
  assert.equal(result.sent,true);
  const mail=sent.at(-1);
  assert.equal(mail.from,'Union Park Landscaping <notifications@verified.example.com>');
  assert.equal(mail.reply_to,'unionparklandscaping@gmail.com');
  assert.match(mail.subject,/Union Park Landscaping/);
  assert.match(mail.html,/https:\/\/www.unionparklandscape.com\/designer\/d\/test-design/);
  assert.doesNotMatch(mail.subject+mail.html+mail.text,/Annie/i);
});
test('designer team notifications go to the UPL inbox with an identifiable subject',async()=>{
  await notifyTeamDesignReady({email:'qa@example.com',designId:'test-design',plan:{items:[]}});
  const mail=sent.at(-1);
  assert.deepEqual(mail.to,['upl-team@example.com']);
  assert.match(mail.subject,/^\[Union Park Landscaping\]/);
  assert.equal(mail.reply_to,'qa@example.com');
  assert.match(mail.text,/unionparklandscape.com/);
});
test('estimate messages identify Union Park for both the team and customer',()=>{
  const lead={kind:'contact',name:'Test Visitor',phone:'3025550100',email:'qa@example.com',message:'Test only'};
  assert.match(renderTeamEmail(lead).subject,/^\[Union Park Landscaping\]/);
  const customer=renderCustomerEmail(lead);
  assert.match(customer.subject,/Union Park Landscaping/);
  assert.equal(customer.replyTo,'unionparklandscaping@gmail.com');
});
test.after(()=>{globalThis.fetch=originalFetch;hooks.deregister()});
