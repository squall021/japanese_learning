import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {kanaRows} from './dist/data.js';
import {kanaStrokes} from './dist/handwriting/strokes.js';
import {pointInBoard,pathFromPoints,strokeLength,cleanWritingProgress,countFeedback} from './dist/handwriting/model.js';

const chars=kanaRows.flat().filter(k=>k?.group==='basic').flatMap(k=>[k.h,k.k]);
assert.equal(chars.length,92);
assert.equal(Object.keys(kanaStrokes).length,92);
for(const char of chars){
  const item=kanaStrokes[char];
  assert.ok(item.paths.length>0&&item.paths.length<=5,char);
  const source=readFileSync(`dist/vendor/kanjivg/${item.source}`,'utf8');
  const original=[...source.matchAll(/<path[^>]*\bid="[^"]+-s\d+"[^>]*\bd="([^"]+)"/g)].map(m=>m[1]);
  assert.deepEqual(item.paths,original,`Unmodified stroke order and geometry for ${char}`);
  for(const path of item.paths)assert.match(path,/^[Mm][\d.-]/);
}
assert.equal(kanaStrokes['あ'].paths.length,3);
assert.equal(kanaStrokes['き'].paths.length,4);
assert.equal(kanaStrokes['さ'].paths.length,3);
assert.equal(kanaStrokes['ア'].paths.length,2);
assert.deepEqual(pointInBoard(150,250,{left:50,top:150,width:200,height:200}),{x:54.5,y:54.5});
assert.deepEqual(pointInBoard(-50,999,{left:50,top:150,width:200,height:200}),{x:0,y:109});
assert.equal(strokeLength([{x:0,y:0},{x:3,y:4}]),5);
assert.equal(strokeLength([{x:0,y:0}]),0);
assert.equal(pathFromPoints([{x:1,y:2},{x:3,y:4}]),'M1.00,2.00 L3.00,4.00');
assert.deepEqual(cleanWritingProgress(undefined,chars),{});
assert.deepEqual(cleanWritingProgress({a:{trace:10},'あ':{trace:2,free:1,lastAt:'2026-10-24'},'ア':{trace:-5,free:Infinity,lastAt:'<bad>'}},chars),{'あ':{trace:2,free:1,lastAt:'2026-10-24'},'ア':{trace:0,free:0,lastAt:''}});
assert.match(countFeedback(2,3),/你寫了 2 筆，範例是 3 筆/);
assert.match(countFeedback(3,3),/筆畫數相同/);
console.log('PASS: 92 templates retain upstream stroke order; き/さ handwriting forms; pointer scaling/clamping; stroke filtering; progress migration and validation; honest count feedback.');
