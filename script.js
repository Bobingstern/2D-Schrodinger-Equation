let c = [ [ { re: 4.91152346344983, im: 0 },
    { re: 0.00007871179085179943, im: 0 },
    { re: -1.827244147458657, im: 0 },
    { re: 0.00015618224974071426, im: 0 },
    { re: 0.2581103777921944, im: 0 } ],
  [ { re: 0.00007871179085177511, im: 0 },
    { re: 1.2614306076318883e-9, im: 0 },
    { re: -0.00002928330898619276, im: 0 },
    { re: 2.5029677467937936e-9, im: 0 },
    { re: 0.0000041364619805338085, im: 0 } ],
  [ { re: -1.8272441474586598, im: 0 },
    { re: -0.00002928330898558539, im: 0 },
    { re: 0.6797933877886367, im: 0 },
    { re: -0.00005810480269506136, im: 0 },
    { re: -0.09602533322478721, im: 0 } ],
  [ { re: 0.00015618224974225792, im: 0 },
    { re: 2.50296773218529e-9, im: 0 },
    { re: -0.0000581048026953466, im: 0 },
    { re: 4.966462099627981e-9, im: 0 },
    { re: 0.000008207689484736359, im: 0 } ],
  [ { re: 0.25811037779219587, im: 0 },
    { re: 0.0000041364619806039115, im: 0 },
    { re: -0.09602533322478664, im: 0 },
    { re: 0.000008207689484758183, im: 0 },
    { re: 0.01356421640246727, im: 0 } ] ]


var data = null;
var graph = null;

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function linspace(startValue, stopValue, cardinality) {
  var arr = [];
  var step = (stopValue - startValue) / (cardinality - 1);
  for (var i = 0; i < cardinality; i++) {
    arr.push(startValue + (step * i));
  }
  return arr;
}

function integrate(lower, upper, f, n){
  let s = 0
  let ban = (upper-lower)/n
  for (let i=1;i<=n-1;i++){
    s+=f(lower + i*ban)
  }
  return 0.5 * ban * (f(lower) + (2*s) + f(upper)) 
}

function meshgrid(x, y){
  let out = []
  let out2 = []
  for (let i=0;i<x.length;i++){
    out.push(x)
  }
  for (let i=0;i<y.length;i++){
    let temp = []
    for (let j=0;j<y.length;j++){
      temp.push(y[i])
    }
    out2.push(temp)
  }
  return [out, out2]
}

function dblInt(f, l, u, l2, u2, n){
  let ss = (u-l)*(u2-l2)/n
  let x = l
  let inte = 0
  while (x<u){
    let y = l2
    while (y<u2){
      let fll = f(x,y)
      let flr = f(x+ss,y)
      let ful = f(x,y+ss)
      let fur = f(x+ss,y+ss)
      let sum = fll+flr+ful+fur
      let vol = 0.25*ss**2*sum
      inte += vol
      y+=ss
    }
    x+=ss
  }
  return inte
}


let L = 20
let m = 1/2
let h = 1
let t = 0
let cs = 5
let progress = 0
let X = linspace(0, L, 30)
let Y = linspace(0, L, 30)

for (let i=0;i<cs;i++){
  let temp = new Array(cs)
  temp.fill(0)
  c.push(temp)
}

function psi0(x,y){
  let s = 20
  let xy0 = L/2
  let d = math.exp(new math.complex(0,0))
  return math.multiply(math.exp(-math.pow(x-xy0,2)/s)*math.exp(-math.pow(y-xy0,2)/s),d)
}
function psi_n(x,y,nx,ny){
  return (2/L) * math.sin(nx*math.pi*x/L)*math.sin(ny*math.pi*y/L)
}


async function c_n(){
  cu = 0
  let tot = cs**2
  for (let a=0;a<c.length;a++){
    for (let b=0;b<c[a].length;b++){
      let n0 = a+1
      let n1 = b+1
      function psi_real(x,y){
        return math.multiply(psi_n(x,y,n0,n1),psi0(x,y)).re
      }
      function psi_im(x,y){
        return math.multiply(psi_n(x,y,n0,n1),psi0(x,y)).im
      }

      c[a][b] = new math.complex(
        dblInt(psi_real,0,L,0,L,1000),
        dblInt(psi_im,0,L,0,L,1000)
      )
      await sleep(0)
      loader.innerHTML = "Calculating Coefficients:"+math.round(cu/tot*100)+"%"
      cu+=1
    }
  }
  loader.innerHTML = "Preparing Animation (might take a while)"
  await sleep(5)
}
function PSI(x, y, t) {
  let val = new math.complex(0,0)
  for (let a=0;a<c.length;a++){
    for (let b=0;b<c[a].length;b++){
      let n0 = a+1
      let n1 = b+1
      n0 = a+1
      n1=b+1
      E = (((h**2)*(math.pi**2))/(2*m*(L**2))) * ((n0**2) + (n1**2))
      let nc = math.multiply(psi_n(x,y,n0,n1), math.exp( new math.complex(0,-E*t) ))
      val = math.add(val, math.multiply(new math.complex(c[a][b]),nc))
    }
  }
  return val
}

// Called when the Visualization API is loaded.
async function drawVisualization() {
  // Create and populate a data table.
  data = new vis.DataSet();
  // create some nice looking data with sin/cos
  var counter = 0;
  let frames = 30
  for (let T=0;T<frames;T++){
    for (let x of X) {
      for (let y of Y) {
        var value = math.abs(PSI(x, y, T))**2;
        data.add({ id: counter++, x: x, y: y, z: value, style: value,filter:T });
      }
    }
  }
  

  // specify options
  var options = {
    width:  '1280px',
    height: '720px',
    style: 'surface',
    showPerspective: true,
    showGrid: true,
    showShadow: false,
    // showAnimationControls: false,
    keepAspectRatio: true,
    verticalRatio: 0.5,
    animationInterval: 75, // milliseconds
    animationPreload: true
  };

  // Instantiate our graph object.
  var container = document.getElementById("mygraph");
  graph = new vis.Graph3d(container, data, options);
  t++
}
//let spinnerWrapper = document.querySelector('.spinner-wrapper');
drawVisualization()
  
