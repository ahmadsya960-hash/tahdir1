(function(){
var K="lessonplan:v1",els=[].slice.call(document.querySelectorAll("[data-k]")),st=document.getElementById("st");
function grow(t){if(t.tagName!=="TEXTAREA")return;t.style.height="auto";var min=t.rows*32;t.style.height=Math.max(min,t.scrollHeight)+"px"}
function save(){var d={};els.forEach(function(e){d[e.dataset.k]=e.value});try{localStorage.setItem(K,JSON.stringify(d));st.textContent="تم الحفظ"}catch(x){st.textContent=""}}
function load(){try{var d=JSON.parse(localStorage.getItem(K)||"{}");els.forEach(function(e){if(d[e.dataset.k]!=null)e.value=d[e.dataset.k]})}catch(x){}els.forEach(grow)}
els.forEach(function(e){e.addEventListener("input",function(){grow(e);save()})});
document.getElementById("pr").onclick=function(){els.forEach(grow);window.print()};
var nw=document.getElementById("nw"),nwT=null;
function rst(){nwT=null;nw.textContent="✚ درس جديد";nw.classList.remove("warn")}
nw.onclick=function(){
if(!nwT){nw.textContent="⚠ اضغط مرة أخرى للتأكيد";nw.classList.add("warn");nwT=setTimeout(rst,4000);return}
clearTimeout(nwT);rst();
els.forEach(function(e){e.value="";grow(e)});picked=[];render();save();st.textContent="تم مسح النموذج، ابدأ درساً جديداً";
};
var go=document.getElementById("go"),up=go,fi=document.getElementById("fi"),dz=document.getElementById("dz"),th=document.getElementById("th"),picked=[];
dz.onclick=function(){fi.click()};
dz.onkeydown=function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();fi.click()}};
function toB64(b){return new Promise(function(ok,no){var r=new FileReader();r.onload=function(){ok(String(r.result).split(",")[1])};r.onerror=no;r.readAsDataURL(b)})}
function thumb(f){return createImageBitmap(f).then(function(b){var s=Math.min(1,140/Math.max(b.width,b.height)),c=document.createElement("canvas");c.width=Math.round(b.width*s);c.height=Math.round(b.height*s);c.getContext("2d").drawImage(b,0,0,c.width,c.height);return c.toDataURL("image/jpeg",0.7)}).catch(function(){return ""})}
function render(){th.innerHTML="";picked.forEach(function(p,i){var w=document.createElement("div");w.className="tb";var im=document.createElement("img");im.src=p.t;im.alt="صورة "+(i+1);var x=document.createElement("button");x.textContent="×";x.setAttribute("aria-label","حذف الصورة");x.onclick=function(){picked.splice(i,1);render()};w.appendChild(im);w.appendChild(x);th.appendChild(w)});go.disabled=!picked.length;dz.textContent=picked.length>=3?"اكتمل العدد (3/3)":"📷 أضف صورة ("+picked.length+"/3)"}
fi.onchange=async function(){var f=[].slice.call(fi.files);fi.value="";var room=3-picked.length;if(f.length>room)st.textContent="الحد الأقصى 3 صور";else st.textContent="";f=f.slice(0,Math.max(0,room));for(var i=0;i<f.length;i++){picked.push({f:f[i],t:await thumb(f[i])})}render()};
function shrink(f){return createImageBitmap(f).then(function(b){var s=Math.min(1,1600/Math.max(b.width,b.height)),c=document.createElement("canvas");c.width=Math.round(b.width*s);c.height=Math.round(b.height*s);c.getContext("2d").drawImage(b,0,0,c.width,c.height);return new Promise(function(ok){c.toBlob(ok,"image/jpeg",0.85)})})}
go.onclick=async function(){
var files=picked.map(function(p){return p.f});if(!files.length)return;
up.disabled=true;go.textContent="⏳ جارٍ التحضير…";st.textContent="قد يستغرق دقيقة";
try{
var blobs=await Promise.all(files.map(shrink));
var imgs=await Promise.all(blobs.map(toB64));
var resp=await fetch("/api/prepare",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({images:imgs})});
if(!resp.ok){var er=new Error("api");er.status=resp.status;throw er}
var r=await resp.json();
var t=(r.text||"").replace(/```json|```/g,""),a=t.indexOf("{"),z=t.lastIndexOf("}");
var d=JSON.parse(t.slice(a,z+1)),n=0;
els.forEach(function(e){var v=d[e.dataset.k];if(typeof v==="string"&&v.trim()){e.value=v;n++;grow(e)}});
els.forEach(grow);save();st.textContent="تم تحضير الدرس ✓ راجعه وعدّل ما تريد";document.querySelector(".page").scrollIntoView({behavior:"smooth"});
}catch(x){st.textContent=(x&&x.status===429)?"تجاوزت الحد المجاني حالياً، حاول بعد دقيقة أو غداً":"تعذّر التحضير، تأكد من إعداد الخادم أو جرّب صورة أوضح"}
finally{up.disabled=!picked.length;go.textContent="✨ انقر للتحضير"}
};
load();
})();

if("serviceWorker" in navigator){window.addEventListener("load",function(){navigator.serviceWorker.register("/sw.js").catch(function(){})})}
