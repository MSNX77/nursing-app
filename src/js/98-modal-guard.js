// ======== v0.9: modals close only via buttons ========
function addX(sel,fn){const mb=document.querySelector(sel+' .mb');if(!mb||mb.querySelector('.xb'))return;const has=[...mb.querySelectorAll('button')].slice(0,4).some(x=>/بستن/.test(x.textContent));if(has)return;const b=document.createElement('button');b.className='xb';b.type='button';b.textContent='✕';b.title='بستن';b.onclick=fn;mb.insertBefore(b,mb.firstChild)}
{const a=drawM,b=drawK,c=drawS;drawM=function(){a();addX('#md',xm)};drawK=function(){b();addX('#kw',xk)};drawS=function(){c();addX('#sg',xs)}}
