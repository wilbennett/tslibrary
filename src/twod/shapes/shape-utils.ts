import { AABBShape } from '.';
import { dir, pos, Vector } from '../../vectors';

export function createWalls(position: Vector, size: Vector, wallThickness: number) {
  const halfSize = size.scaleO(0.5);
  const halfWallThickness = wallThickness * 0.5;
  const offset = dir(halfSize.x + halfWallThickness, 0);
  const temp = pos(0, 0);

  let halfWallSize = dir(halfWallThickness, halfSize.y);
  let wpos = position.addO(offset, temp);
  const rightWall = new AABBShape(halfWallSize.clone());
  rightWall.setPosition(wpos);

  wpos = position.addO(offset.negateO(temp), temp);
  const leftWall = new AABBShape(halfWallSize);
  leftWall.setPosition(wpos);

  offset.withXY(0, halfSize.y + halfWallThickness);
  halfWallSize = dir(halfSize.x + wallThickness, halfWallThickness);
  wpos = position.addO(offset, temp);
  const topWall = new AABBShape(halfWallSize.clone());
  topWall.setPosition(wpos);

  wpos = position.addO(offset.negateO(temp), temp);
  const bottomWall = new AABBShape(halfWallSize);
  bottomWall.setPosition(wpos);

  return [leftWall, bottomWall, rightWall, topWall];
}
