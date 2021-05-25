"use strict"

// import * as THREE from "../../node_modules/three/build/three.module.js";
// let { BufferGeometry, Vector3, Vector2} = THREE;


// import {CSG, Vertex, Vector, Polygon} from "./csg-lib.js";

//import {Geometry} from "../three.js-dev/examples/jsm/deprecated/Geometry.js";

CSG.fromGeometry = function(geom,objectIndex) {
    //   if (geom.isBufferGeometry)
    //        geom = new Geometry().fromBufferGeometry(geom)
    let polys = []
    if (geom.isGeometry) {
        let fs = geom.faces;
        let vs = geom.vertices;
        let fm = ['a', 'b', 'c']
        for (let i = 0; i < fs.length; i++) {
            let f = fs[i];
            let vertices = []
            for (let j = 0; j < 3; j++)
                vertices.push(new Vertex(vs[f[fm[j]]],f.vertexNormals[j],geom.faceVertexUvs[0][i][j]))
            polys.push(new Polygon(vertices, objectIndex))
        }
    } else if (geom.isBufferGeometry) {
        let vertices, normals, uvs
        let posattr = geom.attributes.position
        let normalattr = geom.attributes.normal
        // let uvattr = geom.attributes.uv
        // let colorattr = geom.attributes.color
        let index;
        if (geom.index)
            index = geom.index.array;
        else {
            index = new Array((posattr.array.length / posattr.itemSize) | 0);
            for (let i = 0; i < index.length; i++)
                index[i] = i
        }
        let triCount = (index.length / 3) | 0
        polys = new Array(triCount)
        for (let i = 0, pli = 0, l = index.length; i < l; i += 3,
        pli++) {
            let vertices = new Array(3)
            for (let j = 0; j < 3; j++) {
                let vi = index[i + j]
                let vp = vi * 3;
                let vt = vi * 2;
                let x = posattr.array[vp]
                let y = posattr.array[vp + 1]
                let z = posattr.array[vp + 2]
                let nx = normalattr.array[vp]
                let ny = normalattr.array[vp + 1]
                let nz = normalattr.array[vp + 2]
                // let u = uvattr.array[vt]
                // let v = uvattr.array[vt + 1]
                vertices[j] = new Vertex({
                    x,
                    y,
                    z
                },{
                    x: nx,
                    y: ny,
                    z: nz
                },{
                    x: 0,
                    y: 0,
                    z: 0
                },
                null
            );
            }
            polys[pli] = new Polygon(vertices,objectIndex)
        }
    } else
        console.error("Unsupported CSG input type:" + geom.type)
    return CSG.fromPolygons(polys)
}

let ttvv0 = new THREE.Vector3()
let tmpm3 = new THREE.Matrix3();
CSG.fromMesh = function(mesh,objectIndex) {
    let csg = CSG.fromGeometry(mesh.geometry,objectIndex)
    tmpm3.getNormalMatrix(mesh.matrix);
    for (let i = 0; i < csg.polygons.length; i++) {
        let p = csg.polygons[i]
        for (let j = 0; j < p.vertices.length; j++) {
            let v = p.vertices[j]
            v.pos.copy(ttvv0.copy(v.pos).applyMatrix4(mesh.matrix));
            v.normal.copy(ttvv0.copy(v.normal).applyMatrix3(tmpm3))
        }
    }
    return csg;
}

let nbuf3=(ct)=>{
    return{
        top:0,
        array:new Float32Array(ct),
        write:function(v){(this.array[this.top++]=v.x);(this.array[this.top++]=v.y);(this.array[this.top++]=v.z);}
    }
}
let nbuf2=(ct)=>{
    return{
        top:0,
        array:new Float32Array(ct),
        write:function(v){(this.array[this.top++]=v.x);(this.array[this.top++]=v.y)}
    }
}

CSG.toMesh = function(csg, toMatrix, toMaterial) {

    let ps = csg.polygons;
    let geom;
    let g2;
    if(0) //Old geometry path...
    {
        geom = new Geometry();
        let vs = geom.vertices;
        let fvuv = geom.faceVertexUvs[0]
        for (let i = 0; i < ps.length; i++) {
            let p = ps[i]
            let pvs = p.vertices;
            let v0 = vs.length;
            let pvlen = pvs.length

            for (let j = 0; j < pvlen; j++)
                vs.push(new THREE.Vector3().copy(pvs[j].pos))

            for (let j = 3; j <= pvlen; j++) {
                let fc = new THREE.Face3();
                let fuv = []
                fvuv.push(fuv)
                let fnml = fc.vertexNormals;
                fc.a = v0;
                fc.b = v0 + j - 2;
                fc.c = v0 + j - 1;

                fnml.push(new THREE.Vector3().copy(pvs[0].normal))
                fnml.push(new THREE.Vector3().copy(pvs[j - 2].normal))
                fnml.push(new THREE.Vector3().copy(pvs[j - 1].normal))
                fuv.push(new THREE.Vector3().copy(pvs[0].uv))
                fuv.push(new THREE.Vector3().copy(pvs[j - 2].uv))
                fuv.push(new THREE.Vector3().copy(pvs[j - 1].uv))

                fc.normal = new THREE.Vector3().copy(p.plane.normal)
                geom.faces.push(fc)
            }
        }
        geom = new THREE.BufferGeometry().fromGeometry(geom)
        geom.verticesNeedUpdate = geom.elementsNeedUpdate = geom.normalsNeedUpdate = true;
    }
    if(1) { //BufferGeometry path
        let triCount = 0;
        ps.forEach(p=>triCount += (p.vertices.length - 2))
         geom = new THREE.BufferGeometry()

        let vertices = nbuf3(triCount * 3 * 3)
        let normals = nbuf3(triCount * 3 * 3)
        let uvs = nbuf2(triCount * 2 * 3)
        let colors;
        let grps=[]
        ps.forEach(p=>{
            let pvs = p.vertices
            let pvlen = pvs.length
            if(p.shared!==undefined){
                if(!grps[p.shared])grps[p.shared]=[]
            }
            if(pvlen&&pvs[0].color!==undefined){
                if(!colors)colors = nbuf3(triCount*3*3);
            }
            for (let j = 3; j <= pvlen; j++) {
                (p.shared!==undefined) && (grps[p.shared].push(vertices.top/3,(vertices.top/3)+1,(vertices.top/3)+2));
                vertices.write(pvs[0].pos)
                vertices.write(pvs[j-2].pos)
                vertices.write(pvs[j-1].pos)
                normals.write(pvs[0].normal)
                normals.write(pvs[j-2].normal)
                normals.write(pvs[j-1].normal)
                uvs.write(pvs[0].uv)
                uvs.write(pvs[j-2].uv)
                uvs.write(pvs[j-1].uv)
                colors&&(colors.write(pvs[0].color)||colors.write(pvs[j-2].color)||colors.write(pvs[j-1].color))
            }
        }
        )
        geom.setAttribute('position', new THREE.BufferAttribute(vertices.array,3));
        geom.setAttribute('normal', new THREE.BufferAttribute(normals.array,3));
        geom.setAttribute('uv', new THREE.BufferAttribute(uvs.array,2));
        colors && geom.setAttribute('color', new THREE.BufferAttribute(colors.array,3));
        if(grps.length){
            let index = []
            let gbase=0;
            for(let gi=0;gi<grps.length;gi++){
                geom.addGroup(gbase,grps[gi].length,gi)
                gbase+=grps[gi].length
                index=index.concat(grps[gi]);
            }
            geom.setIndex(index)
        }
        g2 = geom;
    }


    // console.log(new THREE.Matrix4().copy(toMatrix))
    // let inv = new THREE.Matrix4().copy(toMatrix);
    // inv.elements = matrix_invert(inv.elements)
    // console.log(inv)
    // geom.applyMatrix(inv);
    let inv = new THREE.Matrix4().copy(toMatrix).invert();
    // console.log(inv)
    geom.applyMatrix4(inv);
    console.log(geom)
    geom.computeBoundingSphere();
    geom.computeBoundingBox();
    let m = new THREE.Mesh(geom,toMaterial);
    m.matrix.copy(toMatrix);
    m.matrix.decompose(m.position, m.quaternion, m.scale)
    m.rotation.setFromQuaternion(m.quaternion)
    m.updateMatrixWorld();
    m.castShadow = m.receiveShadow = true;
    return m
}


// because of version problem, we use the helper functions below to glue the two libs
function flatten(ary) {
    var ret = [];
    for (var i = 0; i < ary.length; i++) {
        if (Array.isArray(ary[i])) {
            ret = ret.concat(flatten(ary[i]));
        } else {
            ret.push(ary[i]);
        }
    }
    return ret;
}

function matrix_invert(M) {

    M = [M.slice(0, 4), M.slice(4, 8), M.slice(8, 12), M.slice(12, 16)]
    
    // I use Guassian Elimination to calculate the inverse:
    // (1) 'augment' the matrix (left) by the identity (on the right)
    // (2) Turn the matrix on the left into the identity by elemetry row ops
    // (3) The matrix on the right is the inverse (was the identity matrix)
    // There are 3 elemtary row ops: (I combine b and c in my code)
    // (a) Swap 2 rows
    // (b) Multiply a row by a scalar
    // (c) Add 2 rows

    //if the matrix isn't square: exit (error)
    if (M.length !== M[0].length) { return; }

    //create the identity matrix (I), and a copy (C) of the original
    var i = 0, ii = 0, j = 0, dim = M.length, e = 0, t = 0;
    var I = [], C = [];
    for (i = 0; i < dim; i += 1) {
        // Create the row
        I[I.length] = [];
        C[C.length] = [];
        for (j = 0; j < dim; j += 1) {

            //if we're on the diagonal, put a 1 (for identity)
            if (i == j) { I[i][j] = 1; }
            else { I[i][j] = 0; }

            // Also, make the copy of the original
            C[i][j] = M[i][j];
        }
    }

    // Perform elementary row operations
    for (i = 0; i < dim; i += 1) {
        // get the element e on the diagonal
        e = C[i][i];

        // if we have a 0 on the diagonal (we'll need to swap with a lower row)
        if (e == 0) {
            //look through every row below the i'th row
            for (ii = i + 1; ii < dim; ii += 1) {
                //if the ii'th row has a non-0 in the i'th col
                if (C[ii][i] != 0) {
                    //it would make the diagonal have a non-0 so swap it
                    for (j = 0; j < dim; j++) {
                        e = C[i][j];       //temp store i'th row
                        C[i][j] = C[ii][j];//replace i'th row by ii'th
                        C[ii][j] = e;      //repace ii'th by temp
                        e = I[i][j];       //temp store i'th row
                        I[i][j] = I[ii][j];//replace i'th row by ii'th
                        I[ii][j] = e;      //repace ii'th by temp
                    }
                    //don't bother checking other rows since we've swapped
                    break;
                }
            }
            //get the new diagonal
            e = C[i][i];
            //if it's still 0, not invertable (error)
            if (e == 0) { return }
        }

        // Scale this row down by e (so we have a 1 on the diagonal)
        for (j = 0; j < dim; j++) {
            C[i][j] = C[i][j] / e; //apply to original matrix
            I[i][j] = I[i][j] / e; //apply to identity
        }

        // Subtract this row (scaled appropriately for each row) from ALL of
        // the other rows so that there will be 0's in this column in the
        // rows above and below this one
        for (ii = 0; ii < dim; ii++) {
            // Only apply to other rows (we want a 1 on the diagonal)
            if (ii == i) { continue; }

            // We want to change this element to 0
            e = C[ii][i];

            // Subtract (the row above(or below) scaled by e) from (the
            // current row) but start at the i'th column and assume all the
            // stuff left of diagonal is 0 (which it should be if we made this
            // algorithm correctly)
            for (j = 0; j < dim; j++) {
                C[ii][j] -= e * C[i][j]; //apply to original matrix
                I[ii][j] -= e * I[i][j]; //apply to identity
            }
        }
    }

    //we've done all operations, C should be the identity
    //matrix I should be the inverse:
    return flatten(I);
}

// export default CSG
