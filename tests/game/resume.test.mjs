import test from 'node:test';
import assert from 'node:assert/strict';
import {resumeMuseumState,advanceMuseumTransition,blocksRoomInput,activeFrameSeconds} from '../../src/journey-state.js';
const fresh=()=>({mode:'intro',integrity:3,talked:false,solved:false,player:{x:160,y:555,facing:'down'},guard:{x:1130,y:250}});
test('legacy solved save resumes its handoff instead of an unwinnable room',()=>{
 const s=resumeMuseumState({solved:true,talked:true,mode:'play',elapsed:80,identity:true,record:true,letter:true},fresh());
 assert.equal(s.mode,'transition');assert.equal(s.transitionRemaining,2.8);
 assert.equal(advanceMuseumTransition(s,2.8,false),true);assert.equal(s.elapsed,80);assert.equal(s.letter,true);
});
test('transition remaining survives exit and does not advance beneath help',()=>{
 let s=resumeMuseumState({solved:true,transitionRemaining:1.7},fresh());
 assert.equal(advanceMuseumTransition(s,30,true),false);assert.equal(s.transitionRemaining,1.7);
 s=resumeMuseumState(s,fresh());assert.equal(advanceMuseumTransition(s,1,false),false);
 assert.equal(advanceMuseumTransition(s,.71,false),true);
});
test('exhausted save retains evidence and recovery requirement',()=>{
 const s=resumeMuseumState({integrity:0,talked:true,identity:true,record:true,shatters:1},fresh());
 assert.equal(s.mode,'shattered');assert.equal(s.identity,true);assert.equal(s.record,true);assert.equal(s.shatters,1);
});
test('unfinished introduction resumes its dialogue; completed introduction resumes room',()=>{
 assert.equal(resumeMuseumState({talked:false},fresh()).mode,'dialogue');
 assert.equal(resumeMuseumState({talked:true,identity:true},fresh()).mode,'play');
});
test('every blocking overlay rejects room actions; ordinary investigation permits them',()=>{
 const state={mode:'play',investigate:{id:0}};
 assert.equal(Boolean(blocksRoomInput(state)),false);
 for(const key of ['exhausted','paused','puzzle','journal','help','envelope','memory'])assert.equal(Boolean(blocksRoomInput({...state,[key]:true})),true,key);
 assert.equal(Boolean(blocksRoomInput({...state,mode:'film'})),true);
});
test('a suspended renderer gap is not charged as active play time',()=>{
 assert.equal(activeFrameSeconds(1/60),1/60);
 assert.equal(activeFrameSeconds(.6),.6);
 for(const gap of [2,558,3600,NaN,-1])assert.equal(activeFrameSeconds(gap),0);
 const s=resumeMuseumState({solved:true,transitionRemaining:1.7},fresh());
 assert.equal(advanceMuseumTransition(s,activeFrameSeconds(558),false),false);
 assert.equal(s.transitionRemaining,1.7);
});
