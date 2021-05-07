
"use strict";


/* global AFRAME */

if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
}

/**
 * Stl Model component for A-Frame.
 */
AFRAME.registerComponent('stl-model', {
    schema: {
        src: { type: 'asset' }
    },

    /**
     * Set if component needs multiple instancing.
     */
    multiple: false,

    /**
     * Called once when component is attached. Generally for initial setup.
     */
    init: function () {
        this.model = null;
    },

    /**
     * Called when component is attached and when component data changes.
     * Generally modifies the entity based on the data.
     */
    update: function (oldData) {
        let loader;
        var model;
        var el = this.el;
        const data = this.data;
        if (!data.src) return;

        this.remove();
        loader = new STLLoader();
        // console.log(data);
        if (data.crossorigin) loader.setCrossOrigin(data.crossorigin);
        loader.load(data.src, function (geometry) {
            // Apply material.
            var material = el.components.material;
            // if (material) {
            //   geometry.traverse(function (child) {
            //     if (child instanceof THREE.Mesh) {
            //       child.material = material.material;
            //     }
            //   });
            // }

            if (material) {
                model = new THREE.Mesh(geometry, material.material);
            } else {
                model = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial());
            }

            // console.log(model)
            // model.materal.transparent = true;
            // model.materal.opacity = 1;
            el.setObject3D('mesh', model);
            // store an original copy
            // let backup = model.clone();
            // backup.opacity = 0;
            // el.setObject3D('backup', backup);
            // console.log(el.getObject3D("mesh").geometry)
            el.emit('stl-loaded', { format: 'stl', model: model });
        }, function (progress) { }, function (err) { console.log(err) });
    },

    /**
     * Called when a component is removed (e.g., via removeAttribute).
     * Generally undoes all modifications to the entity.
     */
    remove: function () {
        if (this.model) this.el.removeObject3D('mesh');
    },

    /**
     * Called on each scene tick.
     */
    // tick: function (t) { },

    /**
     * Called when entity pauses.
     * Use to stop or remove any dynamic or background behavior such as events.
     */
    pause: function () { },

    /**
     * Called when entity resumes.
     * Use to continue or add any dynamic or background behavior such as events.
     */
    play: function () { },

    /**
     * Write cached attribute data to the entity DOM element.
     *
     * @param {boolean} isDefault - Whether component is a default component. Always flush for
     *   default components.
     */
    flushToDOM: function (isDefault) {
        return;
        // var attrValue = isDefault ? this.data : this.attrValue;
        // if (!attrValue) { return; }
        // //console.log('src', this.data.src)
        // window.HTMLElement.prototype.setAttribute.call(this.el, this.attrName, '#model');

    },
});

function STLLoader(manager) {

    this.manager = (manager !== undefined) ? manager : THREE.DefaultLoadingManager;

};

STLLoader.prototype = {

    constructor: STLLoader,

    load: function (url, onLoad, onProgress, onError) {

        var scope = this;

        var loader = new THREE.FileLoader(scope.manager);
        loader.setResponseType('arraybuffer');
        loader.load(url, function (text) {

            try {

                onLoad(scope.parse(text));

            } catch (exception) {

                if (onError) {

                    onError(exception);

                }

            }

        }, onProgress, onError);

    },

    parse: function (data) {

        function isBinary(data) {

            var expect, face_size, n_faces, reader;
            reader = new DataView(data);
            // for (var i = 0; i < 80; i++)
            // console.log(reader.getUint8( i,false));

            face_size = (32 / 8 * 3) + ((32 / 8 * 3) * 3) + (16 / 8);
            n_faces = reader.getUint32(80, true);
            expect = 80 + (32 / 8) + (n_faces * face_size);

            if (expect === reader.byteLength) {
                return true;

            }

            // An ASCII STL data must begin with 'solid ' as the first six bytes.
            // However, ASCII STLs lacking the SPACE after the 'd' are known to be
            // plentiful.  So, check the first 5 bytes for 'solid'.

            // US-ASCII ordinal values for 's', 'o', 'l', 'i', 'd'

            var solid = [115, 111, 108, 105, 100];

            for (var i = 0; i < 5; i++) {

                // If solid[ i ] does not match the i-th byte, then it is not an
                // ASCII STL; hence, it is binary and return true.

                if (solid[i] != reader.getUint8(i, false)) return true;

            }

            // First 5 bytes read "solid"; declare it to be an ASCII STL

            return false;

        }

        function parseBinary(data) {

            var reader = new DataView(data);
            var faces = reader.getUint32(80, true);

            var r, g, b, hasColors = false, colors;
            var defaultR, defaultG, defaultB, alpha;

            // process STL header
            // check for default color in header ("COLOR=rgba" sequence).

            for (var index = 0; index < 80 - 10; index++) {

                if ((reader.getUint32(index, false) == 0x434F4C4F /*COLO*/) &&
                    (reader.getUint8(index + 4) == 0x52 /*'R'*/) &&
                    (reader.getUint8(index + 5) == 0x3D /*'='*/)) {

                    hasColors = true;
                    console.log("it has colors actually!")
                    colors = [];

                    defaultR = reader.getUint8(index + 6) / 255;
                    defaultG = reader.getUint8(index + 7) / 255;
                    defaultB = reader.getUint8(index + 8) / 255;
                    alpha = reader.getUint8(index + 9) / 255;

                }

            }

            var dataOffset = 84;
            var faceLength = 12 * 4 + 2;

            var geometry = new THREE.BufferGeometry();

            var vertices = [];
            var normals = [];

            for (var face = 0; face < faces; face++) {

                var start = dataOffset + face * faceLength;
                if (start + 12 > reader.byteLength) {
                    break;
                }
                var normalX = reader.getFloat32(start, true);
                var normalY = reader.getFloat32(start + 4, true);
                var normalZ = reader.getFloat32(start + 8, true);

                if (hasColors) {

                    var packedColor = 0;

                    packedColor = reader.getUint16(start + 48, true);


                    if ((packedColor & 0x8000) === 0) {

                        // facet has its own unique color

                        r = (packedColor & 0x1F) / 31;
                        g = ((packedColor >> 5) & 0x1F) / 31;
                        b = ((packedColor >> 10) & 0x1F) / 31;

                    } else {

                        r = defaultR;
                        g = defaultG;
                        b = defaultB;

                    }

                }

                for (var i = 1; i <= 3; i++) {

                    var vertexstart = start + i * 12;
                    //console.log(vertexstart + ":" + reader.byteLength);
                    if (vertexstart + 12 > reader.byteLength) {
                        break;
                    }
                    vertices.push(reader.getFloat32(vertexstart, true));
                    vertices.push(reader.getFloat32(vertexstart + 4, true));
                    vertices.push(reader.getFloat32(vertexstart + 8, true));

                    normals.push(normalX, normalY, normalZ);

                    if (hasColors) {

                        colors.push(r, g, b);

                    }

                }

            }

            geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
            geometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(normals), 3));

            if (hasColors) {

                geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));
                geometry.hasColors = true;
                geometry.alpha = alpha;

            }

            return geometry;

        }

        function parseASCII(data) {

            var geometry = new THREE.BufferGeometry();
            var patternFace = /facet([\s\S]*?)endfacet/g;
            var faceCounter = 0;

            var patternFloat = /[\s]+([+-]?(?:\d+.\d+|\d+.|\d+|.\d+)(?:[eE][+-]?\d+)?)/.source;
            var patternVertex = new RegExp('vertex' + patternFloat + patternFloat + patternFloat, 'g');
            var patternNormal = new RegExp('normal' + patternFloat + patternFloat + patternFloat, 'g');

            var vertices = [];
            var normals = [];

            var normal = new THREE.Vector3();

            var result;

            while ((result = patternFace.exec(data)) !== null) {

                var vertexCountPerFace = 0;
                var normalCountPerFace = 0;

                var text = result[0];

                while ((result = patternNormal.exec(text)) !== null) {

                    normal.x = parseFloat(result[1]);
                    normal.y = parseFloat(result[2]);
                    normal.z = parseFloat(result[3]);
                    normalCountPerFace++;

                }

                while ((result = patternVertex.exec(text)) !== null) {

                    vertices.push(parseFloat(result[1]), parseFloat(result[2]), parseFloat(result[3]));
                    normals.push(normal.x, normal.y, normal.z);
                    vertexCountPerFace++;

                }

                // every face have to own ONE valid normal

                if (normalCountPerFace !== 1) {

                    console.error('THREE.STLLoader: Something isn\'t right with the normal of face number ' + faceCounter);

                }

                // each face have to own THREE valid vertices

                if (vertexCountPerFace !== 3) {

                    console.error('THREE.STLLoader: Something isn\'t right with the vertices of face number ' + faceCounter);

                }

                faceCounter++;

            }

            geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
            geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));

            return geometry;

        }

        function ensureString(buffer) {

            if (typeof buffer !== 'string') {

                return THREE.LoaderUtils.decodeText(new Uint8Array(buffer));

            }

            return buffer;

        }

        function ensureBinary(buffer) {

            if (typeof buffer === 'string') {

                var array_buffer = new Uint8Array(buffer.length);
                for (var i = 0; i < buffer.length; i++) {

                    array_buffer[i] = buffer.charCodeAt(i) & 0xff; // implicitly assumes little-endian

                }
                return array_buffer.buffer || array_buffer;

            } else {

                return buffer;

            }

        }

        // start

        var binData = ensureBinary(data);

        return isBinary(binData) ? parseBinary(binData) : parseASCII(ensureString(data));

    }

};
