import { AnimationLoop } from '../../../animation';
import { WebColors } from '../../../colors';
import { Material, MathEx, TimeStep } from '../../../core';
import { Ease, EaseManager, EaseRunner, NumberEaser } from '../../../easing';
import { FlowFieldNoise } from '../../../flow-fields';
import { Bounds } from '../../../misc';
import { Brush, CanvasContext, ContextProps, Graph, Viewport, World } from '../../../twod';
import {
  CircleCollider,
  Collider,
  CollisionResolver,
  Contact,
  Impulse,
  LinearImpulse,
  ProjectionResolver,
  SimpleBroadPhase,
  SimpleNarrowPhase,
  Sutherland,
  Wcb,
  Wcb2,
} from '../../../twod/collision';
import { AntiGravitational, Fan, Fluid, ForceSource, Gravitational, HeadingForce, Wind } from '../../../twod/forces';
import {
  Align,
  Arrive,
  Cohesion,
  Flee,
  Flow,
  Seek,
  Separate,
  SteeringForce,
  Wander,
} from '../../../twod/forces/steering';
import {
  AABBShape,
  CircleShape,
  createWalls,
  FlowFieldShape,
  PolygonShape,
  setCircleSegmentCount,
  Shape,
} from '../../../twod/shapes';
import { UiUtils } from '../../../utils';
import { dir, pos, Vector } from '../../../vectors';
import { Gaul } from '../test-example/src';

// const { ONE_DEGREE } = MathEx;
// const ZERO_DIRECTION = dir(0, 0);

// console.clear();

const gridExtent = Math.min(window.innerWidth, window.innerHeight);
const canvasb = UiUtils.getCanvasElement("canvasb");
canvasb.width = gridExtent;
canvasb.height = gridExtent;
const ctxb = new CanvasContext(canvasb);

const canvas = UiUtils.getCanvasElement("canvas");
canvas.width = gridExtent;
canvas.height = gridExtent;
const ctx = new CanvasContext(canvas);

const elPause = UiUtils.getInputElement("pause");
const elStepping = UiUtils.getInputElement("stepping");
const elChangeShapes = UiUtils.getInputElement("changeshapes");
const elPrevShapes = UiUtils.getInputElement("prevshapes");
const elStep = UiUtils.getInputElement("step");
const elNextShapes = UiUtils.getInputElement("nextshapes");
const elCollider = UiUtils.getSelectElement("collider");
const elCollideResolve = UiUtils.getSelectElement("collideresolve");

ctx.fillStyle = WebColors.whitesmoke;
ctx.fillRect(ctx.bounds);

const colors: Brush[] = [
  "red",
  "orange",
  "yellow",
  "green",
  "blue",
  "indigo",
  "violet",
  "black",
];

MathEx.epsilon = 0.0001;
Vector.tipDrawHeight = 1.0;
const screenBounds = ctx.bounds;
const origin = pos(0, 0);
const mouse = pos(0, 0);
const gridSize = 20;
let angle = 0;
// const duration = 5;
const pauseAfterSeconds = Infinity;//30;
let autoChangeShapes = true;
// let drawCollision = false;
setCircleSegmentCount(30);
setCircleSegmentCount(360);
setCircleSegmentCount(20);
// setCircleSegmentCount(8);

let [graph, world] = createGraphAndWorld();

const materials: { [index: string]: Material } = {
  default: {
    name: "default",
    restitution: 0.2,
    density: 0,
    staticFriction: 0.5,
    kineticFriction: 0.3
  },

  bouncy: {
    name: "bouncy",
    restitution: 0.7,
    density: 0.6,
    staticFriction: 0.5,
    kineticFriction: 0.3
  },

  superBouncy: {
    name: "super bouncy",
    restitution: 0.9,
    density: 0.6,
    staticFriction: 0.5,
    kineticFriction: 0.3
  },

  wood: {
    name: "wood",
    restitution: 0.4,
    density: 0.6,
    staticFriction: 0.5,
    kineticFriction: 0.3
  },

  plastic: {
    name: "plastic",
    restitution: 0.2,
    density: 0.6,
    staticFriction: 0.5,
    kineticFriction: 0.3
  },
};

const defaultMaterial = materials.default;
const bouncy = materials.bouncy;
const superBouncy = materials.superBouncy;
const plastic = materials.plastic;
// const wood = materials.wood;

// for (const name in materials) { materials[name].restitution = 1; }
// for (const name in materials) { materials[name].staticFriction = 0; }
// for (const name in materials) { materials[name].kineticFriction = 0; }

CircleShape;
// TODO: Something weird happening with rotated circles and collision detection. Need to investigate.
const ball = new CircleShape(2.5, superBouncy);
// const ball = new AABBShape(dir(2.5, 2.5), bouncy);
ball.setPosition(pos(2.5, 7.5));
const ball1 = new CircleShape(1.5, superBouncy);
ball1.setPosition(pos(-2.5, 7.5));
// ball.setPosition(pos(2.5, -0.5));
// ball.velocity = dir(0, -1);
// ball.velocity = dir(0, -0.2);
const ball2 = new AABBShape(dir(5.5, 0.2), plastic);
ball2.setPosition(pos(2.5, 7.5));
ball2.velocity = dir(0, -0.2);
const ball3 = new AABBShape(dir(2.5, 2.5), plastic);
// const ball3 = new CircleShape(2.5, plastic);
ball3.setPosition(pos(2.5, 7.5));
ball3.velocity = dir(0, -0.2);
const triangle = new PolygonShape([pos(1, -5), pos(5, -5), pos(5, 0)], plastic);
// triangle.velocity = dir(0, -0.2);
const wind = new Wind(dir(0, 10));
const windShape = new AABBShape(dir(6, 1.5));
windShape.addAttachedForce(wind);
windShape.isCustomCollide = true;
windShape.position = pos(4, -8.5);
const wind2 = new Wind(dir(0, 5));
const wind2Shape = new AABBShape(dir(8, 2.5));
wind2Shape.addAttachedForce(wind2);
wind2Shape.isCustomCollide = true;
wind2Shape.position = pos(0, -4.5);
const fan = new Fan(5, Vector.fromDegrees(60, 15), 0.4);
fan.position = pos(-10, -10.0);
const fluid = new Fluid(30);
const fluidShape = new AABBShape(dir(4, 1.5));
fluidShape.addAttachedForce(fluid);
fluidShape.isCustomCollide = true;
fluidShape.position = pos(6, 3.5);
const fluid2 = new Fluid(40);
const fluid2Shape = new AABBShape(dir(8, 2.5));
fluid2Shape.addAttachedForce(fluid2);
fluid2Shape.isCustomCollide = true;
fluid2Shape.position = pos(0, -4.5);
const gravitational = new Gravitational(ball1.massInfo.mass * 100000000000000, 8, 80);
const antiGravitational = new AntiGravitational(ball1.massInfo.mass * 10000000000000, 3, 7);
const antiGravitational2 = new AntiGravitational(ball1.massInfo.mass * 10000000000000, 3, 7);
ball.addAttachedForce(antiGravitational2);
const vehicleHeading = new HeadingForce();
vehicleHeading.turnSpeed = 5;
vehicleHeading.angleLookAheadSteps = 3;
vehicleHeading.maxTorque = Math.PI * 2;
const seek = new Seek();
// seek.target = pos(0, 0);
seek.target = mouse;
const arrive = new Arrive();
arrive.target = seek.target;
arrive.radius = 4;
const wander = new Wander();
// const flowField = new FlowFieldRandom(10, 10, dir(15, 15));
const flowField = new FlowFieldNoise(6, 5, dir(14, 5));
flowField.xIncrement = 0.01;
flowField.yIncrement = 0.03;
flowField.minSpeed = 70;
flowField.maxSpeed = 200;
const flow = new Flow();
flow.flowField = flowField;
const steering = new SteeringForce();
// steering.add(seek);
// steering.add(arrive);
// steering.add(wander);
steering.add(flow);
steering.maxActionSpeed = 40;
steering.maxActionForce = 200;
steering.scale = 5;
const vehicle = new PolygonShape([pos(0, -0.5), pos(0.5, -0.5), pos(1.5, 0), pos(0.5, 0.5), pos(0, 0.5)], plastic);
vehicle.integrator.gravityScale = 0.0001;
vehicle.setPosition(pos(0, 7.5));
vehicle.addLocalForce(vehicleHeading);
wander.shape = vehicle;
const flowFieldShape = new FlowFieldShape(flowField);
flowFieldShape.position = pos(3, 7.5);
// ball1.integrator.gravityScale = 0.2;
flow.shape = flowFieldShape;
const [leftWall, bottomWall, rightWall, topWall] = createWalls(origin, dir(20, 20), 3);
leftWall.material = defaultMaterial;
bottomWall.material = defaultMaterial;
rightWall.material = defaultMaterial;
topWall.material = defaultMaterial;

// world.gravityConst = 0;
// vehicle.velocity.withXY(0, -0.01);
// vehicleHeading.turnSpeed = 10;
// vehicleHeading.angleLookAheadSteps = 18;
// ball.integratorType = EulerExplicit;
// ball2.integratorType = EulerExplicit;
// ball3.integratorType = EulerExplicit;
// triangle.integratorType = EulerExplicit;

ball.props = { fillStyle: colors[0], strokeStyle: colors[7], lineWidth: 2 };
ball1.props = { fillStyle: colors[0], strokeStyle: colors[7], lineWidth: 2 };
ball2.props = { fillStyle: colors[0], strokeStyle: colors[7], lineWidth: 2 };
ball3.props = { fillStyle: colors[0], strokeStyle: colors[7], lineWidth: 2 };
triangle.props = { fillStyle: colors[1] };
windShape.props = { fillStyle: "transparent", strokeStyle: "gray", lineWidth: 1 };
fan.props = { fillStyle: "transparent", strokeStyle: "magenta", lineWidth: 1 };
fluidShape.props = { fillStyle: "transparent", strokeStyle: "green", lineWidth: 1 };
fluid2Shape.props = { fillStyle: "transparent", strokeStyle: "green", lineWidth: 1 };
flowFieldShape.props = { fillStyle: "transparent", strokeStyle: "purple", lineWidth: 2 };
flowFieldShape.vectorProps = { fillStyle: "cyan", strokeStyle: "cyan", lineWidth: 2 };
vehicle.props = { fillStyle: colors[0], strokeStyle: colors[7], lineWidth: 2 };
leftWall.props = { fillStyle: colors[0] };
bottomWall.props = { fillStyle: colors[1] };
rightWall.props = { fillStyle: colors[2] };
topWall.props = { fillStyle: colors[3] };

const objectSets: [Shape[], ForceSource[]][] = [
  [[leftWall, bottomWall, rightWall, topWall, flowFieldShape, windShape, fluidShape, vehicle], [steering, fan]],
  // [[leftWall, bottomWall, rightWall, topWall, windShape, vehicle], [steering]],
  [[bottomWall, ball, ball1], []],
  [[bottomWall, ball, ball1], []],
  [[ball], [gravitational]],
  [[leftWall, bottomWall, rightWall, ball], [antiGravitational]],
  [[leftWall, bottomWall, rightWall, ball, wind2Shape], []],
  [[leftWall, bottomWall, rightWall, ball, fluid2Shape], []],
  [[leftWall, bottomWall, rightWall, ball], [fan]],
  [[leftWall, bottomWall, rightWall, topWall, ball2], []],
  [[leftWall, bottomWall, rightWall, topWall, ball2, triangle], []],
  [[leftWall, bottomWall, rightWall, topWall, ball3, triangle], []],
];

const wcb2 = new Wcb2();
const wcb = new Wcb();

const colliders: [string, Collider][] = [
  ["WCB2", new CircleCollider(wcb2)],
  ["Gaul", new Gaul()],
  ["WCB", new CircleCollider(wcb)],
];

const collisionResolvers: [string, CollisionResolver][] = [
  ["Impulse", new Impulse()],
  ["Linear", new LinearImpulse()],
  ["Projection", new ProjectionResolver()],
];

const clipper = new Sutherland();
wcb2.clipper = clipper;
wcb.clipper = clipper;

colliders.forEach(entry => entry[1].clipper = clipper);

type VehicleGroupInfo = { steering: SteeringForce, vehicles: Set<Shape>, index: number };

const vehicleGroups = Array.from<unknown, VehicleGroupInfo>(
  { length: colors.length },
  (_, index) => createVehicleGroupInfo(index));

assignVehicleGroupActions();

let lastRenderTime: DOMHighResTimeStamp | undefined = undefined;
let lastRenderTimeStep: TimeStep | undefined = undefined;
let stepping = elStepping.checked;
let objectSetIndex = 0;
let [shapeSet, forceSet] = objectSets[objectSetIndex];
let currentShapes: Shape[] = [];
let dragging = false;
let dragTarget: Shape | null = null;
const dragOffset = dir(0, 0);
const dragPos = pos(0, 0);
const shapePoint = pos(0, 0);

// const delay = new DelayEaser(2);
const flowXInc = new NumberEaser(0.01, 0.05, 60, Ease.inOutElastic, v => { flowField.xStartOffset = v; });
const flowX = new NumberEaser(0, 10, 60, EaseManager.getRandomEase(), v => { flowField.xStartOffset = v; });
const flowY = new NumberEaser(0, 10, 60, EaseManager.getRandomEase(), v => { flowField.yStartOffset = v; });
const flowZ = new NumberEaser(0, 10, 60, EaseManager.getRandomEase(), v => { flowField.zOffset = v; });

flowX.onCompleted(() => flowX.ease = EaseManager.getRandomEase());
flowY.onCompleted(() => flowY.ease = EaseManager.getRandomEase());
flowZ.onCompleted(() => flowZ.ease = EaseManager.getRandomEase());

const fps = 60;
// const secsPerFrame = 1 / fps;

let frame = -1;
const loop = new AnimationLoop(update, render);
const runner = new EaseRunner(loop);

runner.add(
  // flowXInc.repeat(Infinity),
  flowX.repeat(Infinity),
  flowY.repeat(Infinity),
  flowZ.repeat(Infinity)
);

populateColliders();
populateCollisionResolvers();
drawGraph();
changeShapes();
applyCollider();
applyCollisionResolver();
loop.start();
runner.start();

elPause.addEventListener("change", () => {
  if (elPause.checked)
    loop.stop();
  else
    loop.start();

  setStepping(false);
});

elChangeShapes.addEventListener("change", () => {
  autoChangeShapes = elChangeShapes.checked;

  if (!autoChangeShapes) return;

  changeShapes();
  rerender();
});

elPrevShapes.addEventListener("click", () => {
  objectSetIndex = objectSetIndex > 0 ? objectSetIndex - 1 : objectSets.length - 1;
  changeShapes();
  rerender();
});

elNextShapes.addEventListener("click", () => {
  objectSetIndex = (objectSetIndex + 1) % objectSets.length;
  changeShapes();
  rerender();
});

elStep.addEventListener("click", () => {
  setStepping(true);
  step();
});

elCollider.addEventListener("change", () => {
  applyCollider();
});

elCollideResolve.addEventListener("change", () => {
  applyCollisionResolver();
});

window.addEventListener("resize", () => {
  [graph, world] = createGraphAndWorld();
  drawGraph();
  applyCollider();
  changeShapes();
  rerender();
});

elStepping.addEventListener("change", () => stepping = elStepping.checked);
canvas.addEventListener("mousemove", handleMouseMove);
canvas.addEventListener("mousedown", handleMouseDown);
canvas.addEventListener("dblclick", handleMouseDoubleClick);
canvas.addEventListener("mouseup", handleMouseUp);
canvas.addEventListener("contextmenu", ev => ev.preventDefault());

function update(now: DOMHighResTimeStamp, timestep: TimeStep) {
  const view = graph.getViewport(ctx);

  for (const shape of world.shapes) {
    if (shape.position.y < view.viewBounds.bottom * 4) {
      shapeSet.remove(shape);
      currentShapes.remove(shape);
      world.remove(shape);

      if (shape.tag)
        removeVehicle(shape);
    }
  }

  !dragging && world.update(now, timestep);
}

const propsv: ContextProps = { strokeStyle: "cyan", fillStyle: "cyan", lineWidth: 4, lineDash: [] };

function render(now: DOMHighResTimeStamp, timestep: TimeStep) {
  ++frame === (fps * pauseAfterSeconds) && pause();
  stepping && pause();

  ctx.beginPath().clearRect(ctx.bounds);
  applyTransform();

  world.render(now, timestep);

  const view = world.view!;
  view.applyTransform();

  /*
  world.shapes.forEach(shape => {
    shape.velocity
      .normalizeO().scale(0.5)
      //.scaleO(5)
      .render(view, shape.position, propsv);
  });
  //*/

  // world.contacts.forEach(contact => drawContact(contact, view));
  view.restoreTransform();

  // ball.angle += 1 * ONE_DEGREE;
  // triangle.angle += 1 * ONE_DEGREE;

  restoreTransform();
  lastRenderTime = now;
  lastRenderTimeStep = timestep;
}

function drawGraph() {
  ctxb.beginPath().clearRect(ctxb.bounds);

  ctxb
    .save()
    .translate(screenBounds.center)
    .rotateDegrees(angle)
    .translate(screenBounds.center.negateO());

  graph.render(ctxb);
  ctxb.restore();
}

function applyTransform() {
  ctx
    .save()
    .translate(screenBounds.center)
    .rotateDegrees(angle)
    .translate(screenBounds.center.negateO());
}

function restoreTransform() {
  ctx.restore();
}

function createGraphAndWorld(): [Graph, World] {
  const gridExtent = Math.min(window.innerWidth, window.innerHeight);
  canvasb.width = gridExtent;
  canvasb.height = gridExtent;
  canvas.width = gridExtent;
  canvas.height = gridExtent;

  let graph = new Graph(ctx.bounds.clone(), gridSize);
  graph.background = "black";
  graph.lineBrush = "rgba(70, 70, 70)";
  let world = new World(Bounds.fromCenter(origin, ctx.bounds.size));
  const gview = graph.getViewport(ctx);
  world.createDefaultView(ctx, gview.viewBounds.clone());
  return [graph, world];
}

function setStepping(value: boolean) {
  stepping = value;
  elStepping.checked = value;
}

function pause() {
  loop.stop();
  elPause.checked = true;
}

function step() {
  if (loop.active) return;

  loop.start();
}

function rerender() {
  if (lastRenderTime === undefined || !lastRenderTimeStep) return;

  render(lastRenderTime, lastRenderTimeStep);
}

function updateMouse(ev: MouseEvent) {
  const view = graph.getViewport(ctx);
  const rect = canvas.getBoundingClientRect();
  mouse.withXY(ev.clientX - rect.left, ev.clientY - rect.top);
  view.toWorld(mouse, true, mouse);
}

function handleMouseMove(ev: MouseEvent) {
  if (!dragTarget) return;
  if (!dragging) return;

  updateMouse(ev);
  mouse.displaceByO(dragOffset, dragPos);
  dragTarget.setPosition(dragPos);
  applyCollider();
  rerender();
}

function handleMouseDown(ev: MouseEvent) {
  updateMouse(ev);

  if (ev.button === 1) {
    for (let i = currentShapes.length - 1; i >= 0; i--) {
      const shape = currentShapes[i];
      currentShapes.remove(shape);
      world.remove(shape);

      if (shape.tag)
        removeVehicle(shape);
    }

    rerender();
    return;
  }

  if (ev.ctrlKey && ev.button === 2) {
    addRandomShape(pos(-5, 12));
    addRandomShape(pos(0, 12));
    addRandomShape(pos(5, 12));
    rerender();
    return;
  }

  if (ev.button === 2) {
    if (objectSetIndex === 0)
      addRandomVehicle(mouse);
    else
      addRandomShape(mouse);

    rerender();
    return;
  }

  if (dragging) return;
  if (ev.button !== 0) return;

  let clickedShape: Shape | null = null;

  for (const shape of world.shapes) {
    if (shape === leftWall || shape === bottomWall || shape === rightWall || shape === topWall) continue;

    shape.toLocal(mouse, shapePoint);

    if (!shape.containsPoint(shapePoint, 0.3)) continue;

    clickedShape = shape;
  }

  if (!clickedShape) return;

  clickedShape.position.subO(mouse, dragOffset);
  dragTarget = clickedShape;
  dragging = true;
}

function handleMouseDoubleClick(ev: MouseEvent) {
  updateMouse(ev);

  if (ev.button !== 0) return;

  for (const shape of world.shapes) {
    if (shape === leftWall || shape === bottomWall || shape === rightWall || shape === topWall) continue;

    shape.toLocal(mouse, shapePoint);

    if (!shape.containsPoint(shapePoint, 0.3)) continue;

    // shapeSet.remove(shape);
    world.remove(shape);

    if (shape.tag !== undefined)
      removeVehicle(shape);

    rerender();
    break;
  }
}

function handleMouseUp(ev: MouseEvent) {
  if (!dragging) return;
  if (ev.button !== 0) return;

  dragging = false;
  dragTarget = null;
}

function setShapeProps(shape: Shape) {
  const background = MathEx.random(colors);
  let stroke = MathEx.random(colors);
  while (stroke === background) stroke = MathEx.random(colors);
  shape.props = { fillStyle: background, strokeStyle: stroke, lineWidth: 2 };
}

function addShape(shape: Shape, position: Vector) {
  shape.setPosition(position);
  setShapeProps(shape);
  currentShapes.push(shape);
  world.add(shape);
}

function addRandomCircle(position: Vector) {
  const shape = new CircleShape(MathEx.randomInt(1, 3), bouncy);
  addShape(shape, position);
}

function addRandomPoly(position: Vector) {
  const radius = MathEx.randomInt(2, 3);
  const isRegular = Math.random() < 0.2;
  const shape = new PolygonShape(MathEx.randomInt(3, 8), radius, 0, isRegular, bouncy);
  addShape(shape, position);
}

function addRandomShape(position: Vector) {
  if (Math.random() < 0.2)
    addRandomCircle(position);
  else
    addRandomPoly(position);
}

function createVehicleGroupInfo(groupIndex: number) {
  const steering = new SteeringForce();
  steering.maxActionSpeed = 30;
  steering.maxActionForce = 20;
  steering.scale = 4.5;
  world.addForce(steering);
  return { steering, vehicles: new Set<Shape>(), index: groupIndex };
}

function addVehicleGroupSeparate(index: number, minDistance: number, weight: number) {
  const separateGroup = vehicleGroups[index];
  const steering = separateGroup.steering;
  const separate = new Separate();
  separate.group = separateGroup.vehicles;
  separate.minDistance = minDistance;
  separate.weight = weight;
  steering.add(separate);
}

function addVehicleGroupAlign(index: number, maxDistance: number, weight: number) {
  const alignGroup = vehicleGroups[index];
  const steering = alignGroup.steering;
  const align = new Align();
  align.group = alignGroup.vehicles;
  align.maxDistance = maxDistance;
  align.weight = weight;
  steering.add(align);
}

function addVehicleGroupCohesion(index: number, maxDistance: number, weight: number) {
  const cohesionGroup = vehicleGroups[index];
  const steering = cohesionGroup.steering;
  const cohesion = new Cohesion();
  cohesion.group = cohesionGroup.vehicles;
  cohesion.maxDistance = maxDistance;
  cohesion.weight = weight;
  steering.add(cohesion);
}

function assignVehicleGroupAction(index: number) {
  switch (index) {
    case 0: return addVehicleGroupSeparate(index, 2, 1);
    case 1: return addVehicleGroupSeparate(index, 1, 1);
    case 2:
      addVehicleGroupSeparate(index, 2, 1);
      addVehicleGroupAlign(index, 10, 1);
      break;
    case 3:
      addVehicleGroupSeparate(index, 2, 1);
      addVehicleGroupCohesion(index, 10, 1);
      break;
  }
}

function assignVehicleGroupActions() {
  for (let i = 0; i < vehicleGroups.length; i++) {
    assignVehicleGroupAction(i);
  }
}

function addVehicleWander(vehicle: Shape, steering: SteeringForce) {
  const wander = new Wander();
  wander.maxSpeed = 10;
  wander.maxForce = steering.maxActionForce;
  wander.shape = vehicle;
  steering.add(wander, false);
  addVehicleAntiGrav(vehicle, 5);
}

function addVehicleAntiGrav(vehicle: Shape, duration?: number) {
  const antiGrav = new AntiGravitational(vehicle.massInfo.mass * 10000000000000, 3, 7);
  vehicle.addAttachedForce(antiGrav, duration);
}

function addVehicleSeek(vehicle: Shape, position: Vector, steering: SteeringForce) {
  const seek = new Seek();
  seek.shape = vehicle;
  seek.target = position;
  steering.add(seek);
}

function addVehicleArrive(vehicle: Shape, position: Vector, steering: SteeringForce) {
  const arrive = new Arrive();
  arrive.shape = vehicle;
  arrive.target = position;
  arrive.radius = 10;
  arrive.weight = 3;
  steering.add(arrive);
}

function addVehicleFlee(vehicle: Shape, position: Vector, steering: SteeringForce) {
  const flee = new Flee();
  flee.shape = vehicle;
  flee.target = position;
  flee.radius = 5;
  flee.weight = 3;
  steering.add(flee);
}

function addVehicleAction(vehicle: Shape, group: VehicleGroupInfo) {
  const steering = group.steering;
  const first: Shape = group.vehicles.values().next().value;
  vehicle !== first && addVehicleSeek(vehicle, first.position, steering);

  if (vehicle === first) {
    addVehicleWander(vehicle, steering);
    vehicle.props.strokeStyle = "yellow";
    vehicle.props.lineWidth = 3;
  }

  switch (group.index) {
    case 0:
      break;
    case 1:
      vehicle === first && addVehicleArrive(vehicle, mouse, steering);
      break;
    case 2:
      break;
    case 3:
      // vehicle === first && addVehicleAntiGrav(vehicle);
      break;
    case 4:
      vehicle === first && addVehicleFlee(vehicle, mouse, steering);
      break;
    case 5:
      // vehicle === first && addVehicleAntiGrav(vehicle);
      break;
  }
}

function removeVehicle(vehicle: Shape) {
  const index: number = vehicle.tag;
  const group = vehicleGroups[index];
  let first: Shape = group.vehicles.values().next().value;
  group.vehicles.delete(vehicle);

  if (vehicle !== first) return;
  if (group.vehicles.size === 0) return;

  const steering: SteeringForce = group.steering;
  steering.clear();
  assignVehicleGroupAction(index);
  group.vehicles.forEach(vehicle => addVehicleAction(vehicle, group));
}

function addRandomVehicle(position: Vector) {
  const vehicle = new PolygonShape([pos(0, -0.5), pos(0.5, -0.5), pos(1.5, 0), pos(0.5, 0.5), pos(0, 0.5)], plastic);
  vehicle.setPosition(position);
  vehicle.integrator.gravityScale = 0.0001;

  const bIndex = MathEx.randomInt(colors.length - 1);
  let sIndex = bIndex;
  while (sIndex === bIndex || sIndex === 2) sIndex = MathEx.randomInt(colors.length - 1);
  vehicle.props = { fillStyle: colors[bIndex], strokeStyle: colors[sIndex], lineWidth: 2 };
  vehicle.tag = bIndex;
  const group = vehicleGroups[bIndex];
  group.vehicles.add(vehicle);
  world.add(vehicle);
  addVehicleAction(vehicle, group);
  currentShapes.push(vehicle);

  const vehicleHeading = new HeadingForce();
  vehicleHeading.turnSpeed = 5;
  vehicleHeading.angleLookAheadSteps = 3;
  vehicleHeading.maxTorque = Math.PI * 2;
  vehicle.addLocalForce(vehicleHeading);
}

function populateColliders() {
  for (const [colliderName] of colliders) {
    elCollider.appendChild(UiUtils.createOption(colliderName));
  }
}

function populateCollisionResolvers() {
  for (const [resolverName] of collisionResolvers) {
    elCollideResolve.appendChild(UiUtils.createOption(resolverName));
  }
}

function changeShapes() {
  world.clear();
  vehicleGroups.forEach(g => g.vehicles.clear());

  [shapeSet, forceSet] = objectSets[objectSetIndex];
  shapeSet.forEach(shape => world.add(shape));
  forceSet.forEach(force => world.addForce(force));
  currentShapes = [];

  if (objectSetIndex === 0) {
    vehicleGroups.forEach(g => world.addForce(g.steering));
  }
}

function applyCollisionResolver() {
  const resolver: CollisionResolver = collisionResolvers.find(c => c[0] === elCollideResolve.value)![1];
  world.collisionResolver = resolver;
}

function applyCollider() {
  const collider: Collider = colliders.find(c => c[0] === elCollider.value)![1];
  world.broadPhase = new SimpleBroadPhase(collider);
  world.narrowPhase = new SimpleNarrowPhase(collider);
}

function drawContact(contact: Contact, view: Viewport) {
  // const propsc: ContextProps = { strokeStyle: "greenyellow", fillStyle: "greenyellow", lineWidth: 2, lineDash: [] };
  const propsr: ContextProps = { strokeStyle: "magenta", fillStyle: "magenta", lineWidth: 2, lineDash: [] };
  const propsi: ContextProps = { strokeStyle: "cyan", fillStyle: "cyan", lineWidth: 2, lineDash: [0.2, 0.2] };
  const propsn: ContextProps = { strokeStyle: "yellow", fillStyle: "yellow", lineWidth: 1, lineDash: [] };
  const propsnab: ContextProps = { strokeStyle: "yellow", fillStyle: "yellow", lineWidth: 1, lineDash: [0.2, 0.2] };
  const propsrv: ContextProps = { strokeStyle: "green", fillStyle: "green", lineWidth: 1, lineDash: [] };

  const scaling = 4;
  const normal = contact.normal;
  const normalAB = contact.normalAB;
  const refEdge = contact.referenceEdge;
  const incEdge = contact.incidentEdge;
  refEdge && beginPath(propsr, view).line(refEdge.start, refEdge.end).stroke();
  incEdge && beginPath(propsi, view).line(incEdge.start, incEdge.end).stroke();

  contact.points.forEach(cp => {
    // beginPath(propsc, view).fillRect(Bounds.fromCenter(cp.point, dir(0.5, 0.5)));
    // normal.scaleO(cp.depth).render(view, cp.point, propsn);
    normal.scaleO(cp.depth).scaleO(scaling).render(view, cp.point, propsn);
    normalAB.scaleO(cp.depth).scaleO(scaling).render(view, cp.point, propsnab);

    const relativeVelocity = cp.relativeVelocity;
    relativeVelocity && relativeVelocity.scaleO(scaling).render(view, cp.point, propsrv);
  });
}

function getLineWidth(props: ContextProps, viewport: Viewport) {
  return viewport.calcLineWidth(props.lineWidth !== undefined ? props.lineWidth : 1);
}

function beginPath(props: ContextProps, view: Viewport) {
  view.ctx.beginPath().withGlobalAlpha(1).withProps(props).withLineWidth(getLineWidth(props, view));
  return view.ctx;
}
