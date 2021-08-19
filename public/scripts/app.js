Program =
{
    time_old: 0,
    canvas: document.createElement('canvas'),
    gl: null,
    index_buffer: null,
    Pmatrix: null,
    Vmatrix: null,
    Mmatrix: null,
    proj_matrix: null,
    mov_matrix: null,
    view_matrix: null,
    primitives:
    {
        triangle:
        {
            vertices: [
                -0.5, 0.5, 0.0,
                -0.5, -0.5, 0.0,
                0.5, -0.5, 0.0
            ],
            indices: [ 0, 1, 2 ],
            colors: [
                0.3, 1.0, 1.0, 1.0,  0.3, 1.0, 1.0, 1.0,  0.3, 1.0, 1.0, 1.0,  0.3, 1.0, 1.0, 1.0
            ]
        },
        quad:
        {
            vertices: [
                -0.5, 0.5, 0.0,
                -0.5, -0.5, 0.0,
                0.5, -0.5, 0.0,
                0.5, 0.5, 0.0
            ],
            indices: [ 3, 2, 1, 3, 1, 0 ],
            colors: [
                0.3, 1.0, 1.0, 1.0,  0.3, 1.0, 1.0, 1.0,  0.3, 1.0, 1.0, 1.0,  0.3, 1.0, 1.0, 1.0
            ]
        },
        cube:
        {
            vertices: [
                // front face
                -1.0, -1.0, 1.0,
                 1.0, -1.0, 1.0,
                 1.0, 1.0, 1.0,
                -1.0, 1.0, 1.0,
                // back face
                -1.0, -1.0, -1.0,
                -1.0,  1.0, -1.0,
                 1.0,  1.0, -1.0,
                 1.0, -1.0, -1.0,
                // top face
                -1.0,  1.0, -1.0,
                -1.0,  1.0,  1.0,
                 1.0,  1.0,  1.0,
                 1.0,  1.0, -1.0,
                // bottom face
                -1.0, -1.0, -1.0,
                 1.0, -1.0, -1.0,
                 1.0, -1.0,  1.0,
                -1.0, -1.0,  1.0,
                // right face
                 1.0, -1.0, -1.0,
                 1.0,  1.0, -1.0,
                 1.0,  1.0,  1.0,
                 1.0, -1.0,  1.0,
                // left face
                -1.0, -1.0, -1.0,
                -1.0, -1.0,  1.0,
                -1.0,  1.0,  1.0,
                -1.0,  1.0, -1.0
            ],
            indices: [
                // front
                0,  1,  2,   0,  2,  3,
                // back
                4,  5,  6,   4,  6,  7,
                // top
                8,  9,  10,  8,  10, 11,
                // bottom
                12, 13, 14,  12, 14, 15,
                // right
                16, 17, 18,  16, 18, 19,
                // left
                20, 21, 22,  20, 22, 23
            ],
            colors: [
                0.3, 1.0, 1.0, 0.6,  0.3, 1.0, 1.0, 0.6,  0.3, 1.0, 1.0, 0.6,  0.3, 1.0, 1.0, 0.6,
                1.0, 0.3, 0.3, 0.6,  1.0, 0.3, 0.3, 0.6,  1.0, 0.3, 0.3, 0.6,  1.0, 0.3, 0.3, 0.6,
                0.3, 1.0, 0.3, 0.6,  0.3, 1.0, 0.3, 0.6,  0.3, 1.0, 0.3, 0.6,  0.3, 1.0, 0.3, 0.6,
                0.3, 0.3, 1.0, 0.6,  0.3, 0.3, 1.0, 0.6,  0.3, 0.3, 1.0, 0.6,  0.3, 0.3, 1.0, 0.6,
                1.0, 1.0, 0.3, 0.6,  1.0, 1.0, 0.3, 0.6,  1.0, 1.0, 0.3, 0.6,  1.0, 1.0, 0.3, 0.6,
                1.0, 0.3, 1.0, 0.6,  1.0, 0.3, 1.0, 0.6,  1.0, 0.3, 1.0, 0.6,  1.0, 0.3, 1.0, 0.6
            ]
        }
    },
    async init()
    {
        Program.gl = Program.canvas.getContext('webgl')
        let gl = Program.gl
        let cnv = Program.canvas
        let primitive = Program.primitives.cube
        let vertices = primitive.vertices
        let indices  = primitive.indices
        let colors   = primitive.colors
        
        Program.canvas.width = document.documentElement.clientWidth
        Program.canvas.height = document.documentElement.clientHeight

        // bind buffers and whatnot
        
        // create a new buffer object
        var vertex_buffer = gl.createBuffer()

        // bind an empty array buffer to it
        gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer)

        // pass the vertices data to the buffer
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)

        // unbind the buffer
        // gl.bindBuffer(gl.ARRAY_BUFFER, null)

        let color_buffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW)

        // create and bind the index buffer
        Program.index_buffer = gl.createBuffer()
        let index_buffer = Program.index_buffer

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer)
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW)
        // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)

        /* Create and bind the shader program */

        // vertex shader code
        var vertCode = `
            attribute vec3 position;
            uniform mat4 Pmatrix;
            uniform mat4 Vmatrix;
            uniform mat4 Mmatrix;

            attribute vec4 color;
            varying lowp vec4 vColor;
            void main(void)
            {
                gl_Position = Pmatrix*Vmatrix*Mmatrix*vec4(position, 1.0);
                vColor = color;
            }`
        
        // fragment shader source code
        var fragCode = `
            varying lowp vec4 vColor;
            void main(void) { gl_FragColor = vColor; }`

        // create the shader objects and compile them
        var vertShader = gl.createShader(gl.VERTEX_SHADER)
        gl.shaderSource(vertShader, vertCode)
        gl.compileShader(vertShader)

        // create fragement shader object
        var fragShader = gl.createShader(gl.FRAGMENT_SHADER)
        gl.shaderSource(fragShader, fragCode)
        gl.compileShader(fragShader)

        // create a program object to store the combined shader
        // attach and link programs afterwards
        var shaderProgram = gl.createProgram()
        gl.attachShader(shaderProgram, vertShader)
        gl.attachShader(shaderProgram, fragShader)
        gl.linkProgram(shaderProgram)

        Program.Pmatrix = gl.getUniformLocation(shaderProgram, "Pmatrix")
        Program.Vmatrix = gl.getUniformLocation(shaderProgram, "Vmatrix")
        Program.Mmatrix = gl.getUniformLocation(shaderProgram, "Mmatrix")

        // gl.useProgram(shaderProgram)

        /* Associate shader program(s) to buffer objects */
        
        // get position
        gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer)
        var position = gl.getAttribLocation(shaderProgram, "position")
        gl.vertexAttribPointer(position, 3, gl.FLOAT, false, 0, 0)
        gl.enableVertexAttribArray(position)

        // color
        gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer)
        let color = gl.getAttribLocation(shaderProgram, 'color')
        gl.vertexAttribPointer(color, 4, gl.FLOAT, false, 0, 0)
        gl.enableVertexAttribArray(color)

        // use the shader program
        gl.useProgram(shaderProgram)

        Program.proj_matrix = Program.get_projection(40, cnv.width/cnv.height, 1, 100)
        Program.mov_matrix  = [1, 0, 0, 0,  0, 1, 0, 0,  0, 0, 1, 0,  0, 0, 0, 1]
        Program.view_matrix = [1, 0, 0, 0,  0, 1, 0, 0,  0, 0, 1, 0,  0, 0, 0, 1]

        Program.view_matrix[14] = Program.view_matrix[14]-6

        document.body.appendChild(Program.canvas)
    },
    async run()
    {
        await Program.init()
        await Program.update()
        await Program.draw(0)
    },
    get_projection(angle, a, zMin, zMax)
    {
        let ang = Math.tan((angle*5)*Math.PI/180)
        return [
            0.5/ang, 0, 0, 0,
            0, 0.5*a/ang, 0, 0,
            0, 0, -(zMax+zMin)/(zMax-zMin), -1,
            0, 0, (-2*zMax*zMin)/(zMax-zMin), 0
        ]
    },
    rotateX(m, angle)
    {
        let c   = Math.cos(angle)
        let s   = Math.sin(angle)
        let mv1 = m[1]
        let mv5 = m[5]
        let mv9 = m[9]
        
        m[1] = m[1]*c-m[2]*s
        m[5] = m[5]*c-m[6]*s
        m[9] = m[9]*c-m[10]*s

        m[2]  = m[2]*c+mv1*s
        m[6]  = m[6]*c+mv5*s
        m[10] = m[10]*c+mv9*s
    },
    rotateY(m, angle)
    {
        let c   = Math.cos(angle)
        let s   = Math.sin(angle)
        let mv0 = m[0]
        let mv4 = m[4]
        let mv8 = m[8]
        
        m[0] = c*m[0]+s*m[2]
        m[4] = c*m[4]+s*m[6]
        m[8] = c*m[8]+s*m[10]

        m[2]  = c*m[2]-s*mv0
        m[6]  = c*m[6]-s*mv4
        m[10] = c*m[10]-s*mv8
    },
    rotateZ(m, angle)
    {
        let c   = Math.cos(angle)
        let s   = Math.sin(angle)
        let mv0 = m[0]
        let mv4 = m[4]
        let mv8 = m[8]

        m[0] = c*m[0]-s*m[1]
        m[4] = c*m[4]-s*m[5]
        m[8] = c*m[8]-s*m[9]

        m[1] = c*m[1]+s*mv0
        m[5] = c*m[5]+s*mv4
        m[9] = c*m[9]+s*mv8
    },
    update(){},
    async draw(time)
    {
        let cnv = Program.canvas
        let gl = Program.gl
        let primitive = Program.primitives.cube
        let indices = primitive.indices
        let delta = time - Program.time_old

        Program.rotateZ(Program.mov_matrix, delta*0.005)
        Program.rotateX(Program.mov_matrix, delta*0.002)
        Program.rotateY(Program.mov_matrix, delta*0.003)
        Program.time_old = time

        gl.enable(gl.DEPTH_TEST)
        gl.depthFunc(gl.LEQUAL)
        gl.clearColor(0.5, 0.5, 0.5, 0.9)
        gl.clearDepth(1.0)

        // set the viewport
        gl.viewport(0.0, 0.0, cnv.width, cnv.height)

        // clear the screen
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

        gl.uniformMatrix4fv(Program.Pmatrix, false, Program.proj_matrix)
        gl.uniformMatrix4fv(Program.Vmatrix, false, Program.view_matrix)
        gl.uniformMatrix4fv(Program.Mmatrix, false, Program.mov_matrix)
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Program.index_buffer)

        // draw the triangles
        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0)
        requestAnimationFrame(Program.draw)
    }
}

Program.run()