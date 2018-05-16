/**
 * Parser for Wavefront .obj files
 *
 * Note: Wavefront .obj array indicies are 1-based.
 */
seen.ObjParser = class ObjParser {
    constructor() {
        this.vertices = [];
        this.faces = [];
        this.commands = {
            v: (data) => this.vertices.push(data.map((d) => parseFloat(d))),
            f: (data) => this.faces.push(data.map((d) => parseInt(d))),
        };
    }

    parse(contents) {
        return (() => {
            const result = [];
            for (let line of Array.from(contents.split(/[\r\n]+/))) {
                let data = line.trim().split(/[ ]+/);

                if (data.length < 2) {
                    continue;
                } // Check line parsing

                const command = data.slice(0, 1)[0];
                data = data.slice(1);

                if (command.charAt(0) === "#") {
                    /**
                     * Check for comments
                     */
                    continue;
                }
                if (this.commands[command] == null) {
                    /**
                     * Check that we know how the handle this command
                     */
                    console.log(`OBJ Parser: Skipping unknown command '${command}'`);
                    continue;
                }

                result.push(this.commands[command](data));
            }
            return result;
        })(); // Execute command
    }

    mapFacePoints(faceMap) {
        return this.faces.map((face) => {
            const points = face.map((v) => seen.P(...Array.from(this.vertices[v - 1] || [])));
            return faceMap.call(this, points);
        });
    }
};

/**
 * This method accepts Wavefront .obj file content and returns a `Shape` object.
 */
seen.Shapes.obj = function(objContents, cullBackfaces) {
    if (cullBackfaces == null) {
        cullBackfaces = true;
    }
    const parser = new seen.ObjParser();
    parser.parse(objContents);
    return new seen.Shape(
        "obj",
        parser.mapFacePoints(function(points) {
            const surface = new seen.Surface(points);
            surface.cullBackfaces = cullBackfaces;
            return surface;
        }),
    );
};
