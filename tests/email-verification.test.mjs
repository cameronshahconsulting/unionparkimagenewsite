import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { registerHooks } from 'node:module';

// Exercise the real verification handler with an isolated database fixture.
process.env.RATE_LIMIT_SALT = 'verification-test-salt';
const fixtures = {
  './supabase': `export const supabaseConfigured = true; export function supabaseAdmin() { const query={select(){return this},gte(){return this},then(resolve){return Promise.resolve({count:0,error:null}).then(resolve)},insert:async()=>({error:null}),eq(){return this},order(){return this},limit(){return this},maybeSingle:async()=>({data:globalThis.verificationFixture,error:null}),update(value){globalThis.verificationUpdate=value;return this}}; return {from:()=>query}; }`,
  './guard': `export const normalizeEmail=x=>String(x).trim().toLowerCase(); export const hashEmail=x=>'fixture-email-hash'; export const isValidEmail=x=>x.includes('@'); export const verifyDesignOwnership=async()=>({ok:true});`,
  './designs': 'export const loadDesignPlan=async()=>null;',
  './resend': 'export const sendEmail=async(payload)=>{globalThis.verificationEmail=payload}; export const resendConfigured=()=>true;',
  './site-config': 'export const emailComplianceFooter=()=>({text:"",html:""});',
};
const hooks = registerHooks({resolve(specifier, context, next){
  if(context.parentURL?.endsWith('/lib/email-verify.js') && fixtures[specifier]) return {url:'data:text/javascript,'+encodeURIComponent(fixtures[specifier]),shortCircuit:true};
  if(specifier==='./email-brand') return {url:new URL('../lib/email-brand.js',import.meta.url).href,shortCircuit:true};
  if(specifier==='./site') return {url:new URL('../lib/site.ts',import.meta.url).href,shortCircuit:true};
  return next(specifier,context);
}});
const { confirmVerificationCode, sendVerificationCode } = await import('../lib/email-verify.js');
const hash = createHash('sha256').update('verification-test-salt:qa@example.com:123456').digest('hex');
const row = () => ({id:'fixture',code_hash:hash,attempts:0,expires_at:new Date(Date.now()+60000).toISOString(),verified_at:null});

test('a used code cannot issue another session, even with a wrong code', async()=>{
  globalThis.verificationFixture={...row(),verified_at:new Date().toISOString()};
  const result=await confirmVerificationCode({email:'qa@example.com',code:'000000'});
  assert.equal(result.ok,false); assert.equal(result.cookie,undefined); assert.equal(result.status,400);
});
test('expired and exhausted codes cannot issue sessions', async()=>{
  for(const change of [{expires_at:new Date(0).toISOString()},{attempts:8}]) {
    globalThis.verificationFixture={...row(),...change};
    const result=await confirmVerificationCode({email:'qa@example.com',code:'123456'});
    assert.equal(result.ok,false); assert.equal(result.cookie,undefined);
  }
});
test('wrong code increments attempts without authenticating',async()=>{
  globalThis.verificationFixture=row();
  const result=await confirmVerificationCode({email:'qa@example.com',code:'000000'});
  assert.equal(result.ok,false); assert.equal(globalThis.verificationUpdate.attempts,1);
});
test('a correct unused code issues a session and marks the code used',async()=>{
  globalThis.verificationFixture=row();
  const result=await confirmVerificationCode({email:'qa@example.com',code:'123456'});
  assert.equal(result.ok,true); assert.ok(result.cookie); assert.ok(globalThis.verificationUpdate.verified_at);
});
test('verification email identifies Union Park in its subject, body, and reply address',async()=>{
  globalThis.verificationFixture=null;
  const result=await sendVerificationCode({email:'qa@example.com',ipHash:'fixture'});
  assert.equal(result.ok,true);
  const mail=globalThis.verificationEmail;
  assert.match(mail.subject,/Union Park Landscaping/);
  assert.match(mail.html,/Union Park Landscaping/);
  assert.match(mail.text,/Union Park Landscaping/);
  assert.equal(mail.replyTo,'unionparklandscaping@gmail.com');
  assert.doesNotMatch(mail.subject+mail.text+mail.html,/Annie/i);
});
test.after(()=>hooks.deregister());
