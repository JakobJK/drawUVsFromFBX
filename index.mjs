import {Canvas} from 'skia-canvas'
import minimist from 'minimist';
import { parseText, parseBinary}  from 'fbx-parser'
import * as fs from 'fs'

const drawBackground = () => {
  // TODO: Add Background grid
  ctx.fillStyle = settings.BACKGROUND_COLOR;
  ctx.fillRect(0, 0, settings.UV_SIZE, settings.UV_SIZE);
};

const drawVertices = (fbx) => {
  const objs = fbx.filter( x => x.name === 'Objects')[0]
  const uvs = objs.nodes[1].nodes[5].nodes[4].props[0]; 

  ctx.fillStyle = settings.VERTEX_COLOR;

  for (let i = 0; i < uvs.length; i += 2) {
    const x = uvs[i] * settings.UV_SIZE;
    const y = (1 - uvs[i + 1]) * settings.UV_SIZE;

    ctx.beginPath();
    ctx.arc(x, y, 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
};

const drawEdges = (fbx) => {
  const objs = fbx.filter( x => x.name === 'Objects')[0]

  ctx.strokeStyle = settings.EDGE_COLOR;
  ctx.lineWidth = 1;

  // TODO: A robust way of traversing the FBX. 
  // Cannot rely on array positions.
  const uvs = objs.nodes[1].nodes[5].nodes[4].props[0]; 
  const uvIndices = objs.nodes[1].nodes[5].nodes[5].props[0];
  const faceIndices = objs.nodes[1].nodes[1].props[0]

  const edges = {};

  let lastNoneMinusIdx = 0
  for (let i = 0; i < faceIndices.length; i++) {
    let a;
    let b;

    // FBX will indicate a new face by having the vertex idx
    // listed as negative value (Ex: 22 will be -23).
    if (faceIndices[i] < 0) {
      a = uvIndices[lastNoneMinusIdx];
      b = uvIndices[i];
      lastNoneMinusIdx = i+1
    } else {
      a = uvIndices[i];
      b = uvIndices[i + 1];
    }
    
    const key = [a, b].sort((x, y) => x - y).join("_");
    // Many edges will be repeated by traversing through the faces
    // This will ensure we only draw each edge once
    if (!edges.hasOwnProperty(key)) {
      edges[key] = [uvs[a * 2], uvs[a * 2 + 1], uvs[b * 2], uvs[b * 2 + 1]];
    }
  }

  for (const [_, value] of Object.entries(edges)) {
    const [startX, startY, endX, endY] = value;
    ctx.beginPath();
    ctx.moveTo(startX * settings.UV_SIZE, (1 - startY) * settings.UV_SIZE);
    ctx.lineTo(endX * settings.UV_SIZE, (1 - endY) * settings.UV_SIZE);
    ctx.stroke();
  }
}

const getSettings = () => {
  const argv = minimist(process.argv.slice(2));
  const settings = {
    UV_SIZE: argv?.size ?? 2048,
    FILE_PATH: argv?.file ?? "./model.fbx",
    BACKGROUND_COLOR: argv?.bg ?? "#2e2e2e",
    EDGE_COLOR: argv?.edge_color ?? "red",
    VERTEX_COLOR: argv?.vertex_color ?? "blue",
    OUTPUT_FILE: argv?.output ?? "rainbow.png"
  };
  return settings;
};

const loadFbx = () => {
  let fbx
  try {
    fbx = parseBinary(fs.readFileSync(settings.FILE_PATH))
  } catch (e) {
    fbx = parseText(fs.readFileSync(settings.FILE_PATH, 'utf-8'))
  }
  return fbx
}

const createCanvas = () => {
  const canvas = new Canvas(settings.UV_SIZE, settings.UV_SIZE);
  const ctx = canvas.getContext("2d");
  return {ctx, canvas}
}

async function render() {
  await canvas.saveAs(settings.OUTPUT_FILE, { density: 2 });
}

// TODO: UDIM support
const settings = getSettings() // Get Settings
const fbx = loadFbx() // Load FBX
const {ctx, canvas} = createCanvas() // Build Canvas 
drawBackground()
// TODO: drawFaces(fbx) draw UVs normals blue for front facing, red for backfacing. 
drawEdges(fbx) // Draw Edges
// drawBorderEdges();
drawVertices(fbx) // Draw Vertices

render();