import {catalog,initialScreen,type Screen} from './catalog';
export const MODEL='typesafe/jev-1.13';
export const ENDPOINT='https://openrouter.ai/api/alpha/decisions';
export type Question={type:'choice';instructions:string;criteria:Record<string,string>};
export type Answers=Record<string,{type:'choice';choice:string;confidence?:number;probabilities?:Record<string,number>}>;
const choose=(instructions:string,criteria:Record<string,string>):Question=>({type:'choice',instructions,criteria});
export function buildQuestions(){
 const questions:Record<string,Question>={
 layout:choose('Choose the overall screen layout. Preserve current layout unless a change helps the request.',{grid:'Balanced responsive grid',stack:'One vertical column',split:'Wide primary area and narrow secondary area'}),
 density:choose('Choose information density.',{comfortable:'Roomy and readable',compact:'Tight spacing, more information'}),
 theme:choose('Choose color mode. Preserve current mode unless requested.',{light:'Light background',dark:'Dark background'}),
 scenario:choose('Choose the most relevant sample data context.',{overview:'Revenue, sales, analytics, dashboards',planning:'Calendar, tasks, scheduling and productivity',settings:'Preferences, profile, account, forms',conversation:'Messages, chat, assistant, attachments'}),
 emphasis:choose('Which component deserves the most space?',Object.fromEntries(catalog.map(c=>[c.id,c.name]))),
 };
 for(const c of catalog)questions['component_'+c.id]=choose(`Where should ${c.name} appear? Category: ${c.group}. Select only useful components. Aim for 3–8 unless the user explicitly asks for more or all. Embedded primitives already inside another block do not need standalone copies. Preserve relevant current components for follow-up edits.`,{hidden:'Do not show as a standalone block',first:'At the top, high priority',middle:'Main content, normal priority',last:'Supporting content at the end'});
 return questions;
}
export function parseAnswers(input:unknown):{screen:Screen;answers:Answers}{
 if(!input||typeof input!=='object'||!('answers' in input))throw new Error('Jev returned no decisions. Try again.');
 const source=(input as {answers:unknown}).answers;
 if(!source||typeof source!=='object')throw new Error('Invalid decisions response.');
 const questions=buildQuestions();const answers:Answers={};
 for(const [id,q] of Object.entries(questions)){
 const a=(source as Record<string,unknown>)[id];
 if(!a||typeof a!=='object'||!('choice' in a)||!Object.hasOwn(q.criteria,String(a.choice)))throw new Error(`Invalid decision: ${id}.`);
 const value=a as {choice:string;confidence?:unknown;probabilities?:unknown};
 answers[id]={type:'choice',choice:value.choice};
 if(typeof value.confidence==='number'&&Number.isFinite(value.confidence)&&value.confidence>=0&&value.confidence<=1)answers[id].confidence=value.confidence;
 }
 const order=['first','middle','last'];
 const components=catalog.filter(c=>answers['component_'+c.id].choice!=='hidden').sort((a,b)=>order.indexOf(answers['component_'+a.id].choice)-order.indexOf(answers['component_'+b.id].choice)).map(c=>c.id);
 return {screen:{components,layout:answers.layout.choice as Screen['layout'],density:answers.density.choice as Screen['density'],theme:answers.theme.choice as Screen['theme'],scenario:answers.scenario.choice as Screen['scenario'],emphasis:answers.emphasis.choice},answers};
}
export function validateScreen(value:unknown):Screen{
 if(!value||typeof value!=='object')throw new Error('Invalid screen.');
 const v=value as Screen;
 if(!Array.isArray(v.components)||v.components.length>catalog.length||new Set(v.components).size!==v.components.length||v.components.some(id=>!catalog.some(c=>c.id===id))||!['grid','stack','split'].includes(v.layout)||!['comfortable','compact'].includes(v.density)||!['light','dark'].includes(v.theme)||!['overview','planning','settings','conversation'].includes(v.scenario)||!catalog.some(c=>c.id===v.emphasis))throw new Error('Invalid screen.');
 return {components:[...v.components],layout:v.layout,density:v.density,theme:v.theme,scenario:v.scenario,emphasis:v.emphasis};
}
export function demoCompose(prompt:string,current:Screen=initialScreen):Screen{
 const p=prompt.toLowerCase();const next={...current,components:[...current.components]};
 if(/sales|dashboard|revenue|analytic/.test(p))Object.assign(next,initialScreen);
 if(/plan|week|calendar|task/.test(p))Object.assign(next,{scenario:'planning',components:['calendar','checkbox','progress','accordion'],layout:'split',emphasis:'calendar'});
 if(/setting|profile|account|form/.test(p))Object.assign(next,{scenario:'settings',components:['avatar','field','select','switch','button'],layout:'stack',emphasis:'field'});
 if(/chat|message|conversation/.test(p))Object.assign(next,{scenario:'conversation',components:['message','bubble','attachment','input-group'],layout:'stack',emphasis:'message'});
 if(/all (the )?components|entire library/.test(p))next.components=catalog.map(c=>c.id);
 if(/compact|dense/.test(p))next.density='compact';if(/comfortable|roomy/.test(p))next.density='comfortable';
 if(/dark/.test(p))next.theme='dark';if(/light/.test(p))next.theme='light';
 if(/grid/.test(p))next.layout='grid';if(/single column|stack/.test(p))next.layout='stack';if(/split/.test(p))next.layout='split';
 for(const c of catalog){if(p.includes(c.name.toLowerCase())){if(new RegExp(`(?:hide|remove|without) (?:the )?${c.name.toLowerCase()}`).test(p))next.components=next.components.filter(id=>id!==c.id);else if(!next.components.includes(c.id))next.components.push(c.id);}}
 return next;
}
