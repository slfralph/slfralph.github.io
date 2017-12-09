var WIDTH;
var HEIGHT;
var MAX_SIZE = 15;
var MIN_SIZE = 2;
var DISPLAY_BUFFER = 10;
var NODES_PER_PIXEL = .00015;
var NODES_DRAWN = false;

var MIN_NUMBER_PATHS = 10;
var MAX_NUMBER_PATHS = 15;
var MIN_PATH_LENGTH = 40;
var MAX_PATH_LENGTH = 45;
var MAX_NEIGHBOR_DISTANCE;
var NEIGHBOR_WINDOW;
var FURTHEST_ELIGIBLE_NEIGHBOR = 7;
var VISITED_CAP = 4;

var SCALAR_BASE = .01;
var SCALAR = SCALAR_BASE;
var ANIMATION_RATE = .02;

var nodes;
var paths;

class Node {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.visited = 0;
  }
}

function setup() {
  frameRate(60);

  WIDTH = document.getElementById("sketch").offsetWidth;
  HEIGHT = document.getElementById("sketch").offsetHeight;

  // SETTING UP CANVAS
  canvas = createCanvas(WIDTH, HEIGHT);
  canvas.parent('sketch');
  canvas.id('sketch-js');

  // TODO: NEED TO MAKE SURE NONE OF THE POINTS WILL OVERLAP WHEN GENERATED
  // TODO: ADD TIMER SO THAT SETUP / DRAW ARE NOT RERUN WHILE RAPIDLY RESIZING

  // DETERMINE AMOUNT OF NODES
  nodes = new Array(int(WIDTH * HEIGHT * NODES_PER_PIXEL));

  // SETTING VARS TO BE USED LATER BY THE ANIMATION
  MAX_NEIGHBOR_DISTANCE = WIDTH / 5;
  NEIGHBOR_WINDOW = int(nodes.length / 10);

  // CREATE NODES
  var y = 1;
  for (i = 0; i < nodes.length; i++) {
    y = y + 1;
    nodes[i] = new Node(
      random(-DISPLAY_BUFFER, WIDTH + DISPLAY_BUFFER),
      map(noise(y), 0, 1, -DISPLAY_BUFFER, HEIGHT + DISPLAY_BUFFER),
      random(MIN_SIZE, MAX_SIZE));
  }

  // SORT NODE LIST
  nodes.sort(function(a, b) {
    return (a.x) - (b.x);
  });


  // console.log("NODES: ", nodes);
  // console.log("LENGTH: " + nodes.length);

  // CREATE PATHS
  paths = new Array();
  for (i = 0; i < int(random(MIN_NUMBER_PATHS, MAX_NUMBER_PATHS)); i++) {

    var path = new Array();
    var seed = int(random(nodes.length));
    var n = nodes[seed];

    for (j = 0; j < int(random(MIN_PATH_LENGTH, MAX_PATH_LENGTH)); j++) {
      path.push({
        node: n,
        draw: false,
        animation_complete: false
      });
      n.visited++;

      var eligible_neighbors = new Array();
      var start = seed - NEIGHBOR_WINDOW < 0 ? 0 : seed - NEIGHBOR_WINDOW;
      var stop = seed + NEIGHBOR_WINDOW > nodes.length ? nodes.length : seed + NEIGHBOR_WINDOW;

      // console.log("START: " + start, "SEED: " + seed, "STOP: " + stop);

      // for (z = start; z < stop && z != seed; z++) {
      for (z = start; z < stop; z++) {
        // console.log("SEED: " + nodes[seed].x, "Z: " + nodes[z].x);
        var d = distance(nodes[seed], nodes[z]);
        // console.log("Distance: ", d);
        if (d < MAX_NEIGHBOR_DISTANCE && nodes[z].visited < VISITED_CAP) {
          eligible_neighbors.push({
            pos: z,
            dist: d
          });
        }
      }

      if (eligible_neighbors.length != 0) {
        eligible_neighbors.sort(function(a, b) {
          return (a.dist) - (b.dist);
        });

        // console.log("SEED");
        // console.log(nodes[seed]);
        // console.log("NEAREST NEIGHBOR");
        // console.log(nodes[eligible_neighbors[0].pos]);
        // console.log("ELIGIBLE NEIGHBORS");
        // for (n of eligible_neighbors){
        //   console.log(nodes[n.pos]);
        // }
        // console.log(eligible_neighbors);

        // TODO: ADD PERLIN NOISE
        // seed = random(eligible_neighbors).pos;
        seed = eligible_neighbors.length > FURTHEST_ELIGIBLE_NEIGHBOR ?
          eligible_neighbors[int(random(FURTHEST_ELIGIBLE_NEIGHBOR))].pos :
          random(eligible_neighbors).pos;
        n = nodes[seed];

      } else {
        break;
      }
    }

    path[0].draw = true;
    path[0].animation_complete = true;
    paths.push(path);
  }
  // console.log("PATHS");
  // console.log(paths);
}

function draw() {

  // DRAW NODES
  noStroke();

  if (!NODES_DRAWN) {
    for (i = 0; i < nodes.length; i++) {
      fill(0, 18, 48, random(50, 200));
      ellipse(nodes[i].x, nodes[i].y, nodes[i].z);
    }
    NODES_DRAWN = true;
  }

  // DRAW PATHS
  stroke(81, 112, 160);
  strokeWeight(1);

  for (const p of paths) {
    for (i = 0; i < p.length - 1; i++) {
      if (p[i].draw) {
        if (!p[i+1].animation_complete) {
          var dx = p[i].node.x + (p[i + 1].node.x - p[i].node.x) * SCALAR;
          var dy = p[i].node.y + (p[i + 1].node.y - p[i].node.y) * SCALAR;
          line(p[i].node.x, p[i].node.y, dx, dy);

          if (SCALAR + ANIMATION_RATE > 1) {
            p[i + 1].animation_complete = true;
            p[i + 1].draw = true;
            break;
          }
        } else {
          line(p[i].node.x, p[i].node.y, p[i + 1].node.x, p[i + 1].node.y);
        }
      }
    }
  }

  var stop_animation = true;
  for (const p of paths){
    if (!p[p.length - 1].animation_complete){
      stop_animation = false;
    }
  }

  if (stop_animation) noLoop();

  // console.log("ANIMATION");

  SCALAR = SCALAR + ANIMATION_RATE > 1 ? SCALAR_BASE : SCALAR + ANIMATION_RATE;
}

function windowResized() {
  NODES_DRAWN = false;
  setup();
  redraw();
}

function distance(node1, node2) {
  return sqrt(sq(node1.x - node2.x) + sq(node1.y - node2.y));
}
