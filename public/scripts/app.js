Program =
{
    canvas: document.createElement('canvas'),
    gl: null,
    primitives:
    {
        triangle:
        {
            vertices: [
                -0.5, 0.5, 0.0,
                -0.5, -0.5, 0.0,
                0.5, -0.5, 0.0
            ],
            indices: [ 0, 1, 2 ]
        },
        quad:
        {
            vertices: [
                -0.5, 0.5, 0.0,
                -0.5, -0.5, 0.0,
                0.5, -0.5, 0.0,
                0.5, 0.5, 0.0
            ],
            indices: [ 3, 2, 1, 3, 1, 0 ]
        }
    },
    init()
    {
        Program.gl = Program.canvas.getContext('webgl')
        let gl = Program.gl
        let triangle = Program.primitives.quad
        let vertices = triangle.vertices
        let indices  = triangle.indices
        
        Program.canvas.width = 1280 // document.documentElement.clientWidth
        Program.canvas.height = 720 // document.documentElement.clientHeight

        // bind buffers and whatnot
        
        // create a new buffer object
        var vertex_buffer = gl.createBuffer()

        // bind an empty array buffer to it
        gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer)

        // pass the vertices data to the buffer
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)

        // unbind the buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, null)

        // create and bind the index buffer
        let index_buffer = gl.createBuffer()

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer)
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW)
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)

        /* Create and bind the shader program */

        // vertex shader code
        var vertCode =
            `attribute vec4 coordinates;
            uniform vec4 translation;
            uniform mat4 u_xformMatrix;
            void main(void) { gl_Position = u_xformMatrix * (coordinates + translation); }`

        // create vertex shader object
        var vertShader = gl.createShader(gl.VERTEX_SHADER)

        // attach vertex shader code
        gl.shaderSource(vertShader, vertCode)

        // compile shader
        gl.compileShader(vertShader)

        // fragment shader source code
        var fragCode = `void main(void) { gl_FragColor = vec4(1.0, 0.5, 0.0, 1.0); }`

        // create fragement shader object
        var fragShader = gl.createShader(gl.FRAGMENT_SHADER)

        // attach fragment shader code
        gl.shaderSource(fragShader, fragCode)

        // compile fragment shader
        gl.compileShader(fragShader)

        // create a program object to store the combined shader
        var shaderProgram = gl.createProgram()

        // attach vertex shader
        gl.attachShader(shaderProgram, vertShader)

        // attach fragment shader
        gl.attachShader(shaderProgram, fragShader)

        // link both shaders
        gl.linkProgram(shaderProgram)

        // use the shader program
        gl.useProgram(shaderProgram)

        /* Associate shader program(s) to buffer objects */
        
        // bind the vertex and buffers
        gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer)
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer)

        // get attribute location
        var coord = gl.getAttribLocation(shaderProgram, "coordinates")

        // point attribute to currently bound VBO
        gl.vertexAttribPointer(coord, 3, gl.FLOAT, false, 0, 0)

        // enable the attribute
        gl.enableVertexAttribArray(coord)

        let scale = gl.canvas.height / gl.canvas.width
        console.log(scale)

        // scale
        let sX = 1.0 * scale
        let sY = 1.0
        let sZ = 1.0

        let xformMatrix = new Float32Array([
            sX, 0.0, 0.0, 0.0,
            0.0, sY, 0.0, 0.0,
            0.0, 0.0, sZ, 0.0,
            0.0, 0.0, 0.0, 1.0
        ])

        let u_xformMatrix = gl.getUniformLocation(shaderProgram, 'u_xformMatrix')
        gl.uniformMatrix4fv(u_xformMatrix, false, xformMatrix)

        // translation
        let tX = 0.0
        let tY = 0.0
        let tZ = 0.0
        
        let translation = gl.getUniformLocation(shaderProgram, 'translation')
        gl.uniform4f(translation, tX, tY, tZ, 0)

        document.body.appendChild(Program.canvas)
    },
    async run()
    {
        await Program.init()
        await Program.update()
        await Program.draw()
    },
    update(){},
    async draw()
    {
        let cnv = Program.canvas
        let gl = Program.gl
        let triangle = Program.primitives.quad
        let vertices = triangle.vertices
        let indices = triangle.indices

        // set clear color
        gl.clearColor(0.5, 0.5, 0.5, 0.9)

        // enable depth test
        gl.enable(gl.DEPTH_TEST)

        // clear the screen
        gl.clear(gl.COLOR_BUFFER_BIT)

        // set the viewport
        gl.viewport(0, 0, cnv.width, cnv.height)

        // draw the triangles
        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0)
        requestAnimationFrame(Program.draw)
    }
}

Program.run()