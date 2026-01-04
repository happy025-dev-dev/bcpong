const canvas=document.getElementById('game')
const ctx=canvas.getContext('2d')
const scoreLeftEl=document.getElementById('score-left')
const scoreRightEl=document.getElementById('score-right')
let width=800
let height=500
function resize(){
  const ratio=window.devicePixelRatio||1
  const rect=canvas.getBoundingClientRect()
  width=Math.min(1000,Math.max(400,rect.width))
  height=Math.floor(width*0.625)
  canvas.width=width*ratio
  canvas.height=height*ratio
  canvas.style.height=height+'px'
  ctx.setTransform(ratio,0,0,ratio,0,0)
}
window.addEventListener('resize',resize)
resize()
const paddleWidth=10
const paddleHeight=100
const netWidth=2
const maxScore=11
const state={
  left:{x:20,y:height/2-paddleHeight/2,vy:0,score:0},
  right:{x:width-20-paddleWidth,y:height/2-paddleHeight/2,vy:0,score:0},
  ball:{x:width/2,y:height/2,r:8,vx:6,vy:3},
  running:false,
  lastTime:0,
  input:{up:false,down:false},
  pauseTimer:0
}
function resetBall(direction){
  state.ball.x=width/2
  state.ball.y=height/2
  const speed=6
  const angle=(Math.random()*Math.PI/4)-Math.PI/8
  state.ball.vx=(direction||(Math.random()<0.5?1:-1))*speed*Math.cos(angle)
  state.ball.vy=speed*Math.sin(angle)
  state.pauseTimer=60
}
resetBall(1)
function draw(){
  ctx.clearRect(0,0,width,height)
  ctx.fillStyle='#021826'
  ctx.fillRect(0,0,width,height)
  ctx.fillStyle='#083044'
  for(let i=0;i<height;i+=20){
    ctx.fillRect(width/2-netWidth/2,i,netWidth,12)
  }
  ctx.fillStyle='#9fe8ff'
  ctx.fillRect(state.left.x,state.left.y,paddleWidth,paddleHeight)
  ctx.fillRect(state.right.x,state.right.y,paddleWidth,paddleHeight)
  ctx.beginPath()
  ctx.fillStyle='#ffd'
  ctx.arc(state.ball.x,state.ball.y,state.ball.r,0,Math.PI*2)
  ctx.fill()
  ctx.fillStyle='#00d1ff'
  ctx.font='26px system-ui,Arial'
  ctx.textAlign='center'
  ctx.fillText(state.left.score, width*0.25, 40)
  ctx.fillText(state.right.score, width*0.75, 40)
}
function update(){
  const speed=6
  if(state.input.up) state.left.y-=8
  if(state.input.down) state.left.y+=8
  if(state.left.y<0) state.left.y=0
  if(state.left.y+paddleHeight>height) state.left.y=height-paddleHeight
  const targetY=state.ball.y-paddleHeight/2
  const dir=targetY-(state.right.y)
  state.right.y+=Math.sign(dir)*Math.min(6,Math.abs(dir)*0.08)
  if(state.right.y<0) state.right.y=0
  if(state.right.y+paddleHeight>height) state.right.y=height-paddleHeight
  if(state.pauseTimer>0){state.pauseTimer--;return}
  state.ball.x+=state.ball.vx
  state.ball.y+=state.ball.vy
  if(state.ball.y-state.ball.r<0||state.ball.y+state.ball.r>height){
    state.ball.vy*=-1
  }
  const hitLeft=state.ball.x-state.ball.r<=state.left.x+paddleWidth&&state.ball.y>state.left.y&&state.ball.y<state.left.y+paddleHeight
  const hitRight=state.ball.x+state.ball.r>=state.right.x&&state.ball.y>state.right.y&&state.ball.y<state.right.y+paddleHeight
  if(hitLeft){
    state.ball.x=state.left.x+paddleWidth+state.ball.r
    const rel=(state.ball.y-(state.left.y+paddleHeight/2))/(paddleHeight/2)
    const speed=Math.min(12,Math.hypot(state.ball.vx,state.ball.vy)*1.05)
    const angle=rel*(Math.PI/3)
    state.ball.vx=Math.abs(speed*Math.cos(angle))
    state.ball.vy=speed*Math.sin(angle)
  }else if(hitRight){
    state.ball.x=state.right.x-state.ball.r
    const rel=(state.ball.y-(state.right.y+paddleHeight/2))/(paddleHeight/2)
    const speed=Math.min(12,Math.hypot(state.ball.vx,state.ball.vy)*1.05)
    const angle=rel*(Math.PI/3)
    state.ball.vx=-Math.abs(speed*Math.cos(angle))
    state.ball.vy=speed*Math.sin(angle)
  }
  if(state.ball.x<0){
    state.right.score++
    scoreRightEl.textContent=state.right.score
    if(state.right.score>=maxScore){state.running=false}
    resetBall(1)
  }else if(state.ball.x>width){
    state.left.score++
    scoreLeftEl.textContent=state.left.score
    if(state.left.score>=maxScore){state.running=false}
    resetBall(-1)
  }
}
function loop(t){
  if(!state.lastTime) state.lastTime=t
  const dt=t-state.lastTime
  state.lastTime=t
  if(state.running) update()
  draw()
  requestAnimationFrame(loop)
}
requestAnimationFrame(loop)
window.addEventListener('keydown',e=>{
  if(e.key==='w'||e.key==='W'||e.key==='ArrowUp'){state.input.up=true}
  if(e.key==='s'||e.key==='S'||e.key==='ArrowDown'){state.input.down=true}
  if(e.key===' '){state.running=!state.running}
})
window.addEventListener('keyup',e=>{
  if(e.key==='w'||e.key==='W'||e.key==='ArrowUp'){state.input.up=false}
  if(e.key==='s'||e.key==='S'||e.key==='ArrowDown'){state.input.down=false}
})
canvas.addEventListener('mousemove',e=>{
  const rect=canvas.getBoundingClientRect()
  const y=(e.clientY-rect.top)/rect.height*height
  state.left.y=y-paddleHeight/2
  if(state.left.y<0) state.left.y=0
  if(state.left.y+paddleHeight>height) state.left.y=height-paddleHeight
})
canvas.addEventListener('click',()=>{
  state.running=!state.running
})
window.addEventListener('blur',()=>{state.running=false})
resize()