

THREE.TestShader = {
	uniforms: {
		"tColor": { type: "t", value:null},
		"tDepth": { type: "t", value: null},
		"znear": {type: "f", value: 1.00},
		"zfar": {type: "f", value: 1000.0},
		"aspect":   { type: "f", value: 1.0 },
		"size":         { type: "v2", value: new THREE.Vector2(512, 512) },
		"textel":		{ type: "v2", value: new THREE.Vector2(1/512, 1/512)},
		"bias":			{ type: "f", value: 0.5 },
		"noise":		{ type: "i", value: 1 },
		"namount":		{ type: "f", value: 0.0001 },
		"focalDepth": { type: "f", value: 20.00},
		"focalLength": {type: "f", value: 100.00},
		"aperture": {type: "f", value: 8.00}
		

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
		"}"

	].join("\n"),

	fragmentShader: [
		"precision mediump float;",
		"#define PI  3.14159265",

// **********
		"varying vec2 vUv;",

		// uniform variables from external script
		"uniform sampler2D tColor;",
		"uniform sampler2D tDepth;",
		"uniform vec2 size;", // texture width and height
		"uniform vec2 texel;", // textel size


		//make sure that these two values are the same for your camera, otherwise distances will be wrong.
		"uniform float znear;", //camera clipping start
		"uniform float zfar;", //camera clipping end
		"uniform float aspect;",

		// user variables now passed as uniforms
		"uniform float focalDepth;",
		"uniform float focalLength;",
		"uniform float aperture;",

		//used for colour
		"uniform float bias;", // bokeh edge bias
		"uniform bool noise;", // use noise instead of pattern for sample dithering
		"uniform float namount;", // dither amount

		//lets get rid of these
		// samples and rings need to be constants. no dynamic loop counters in OpenGL ES
		// Can shader be broken into 2 pass? ... 
		"int samples = 3;", //samples on the first ring
		"const int rings = 3;", //ring count

		//used in the cacluation of depth of field
		"float coc = 0.03;",
		"float dfar =0.0;",
		"float dnear = 0.0;",
//*********
//functions

		// RGBA depth needs to unpack the depth 	
		"float unpackDepth(const in vec4 rgba_depth) {",

			"const vec4 bit_shift = vec4(1.0 / (256.0 * 256.0 * 256.0), 1.0 / (256.0 * 256.0), 1.0 / 256.0, 1.0);",
			"float depth = dot(rgba_depth, bit_shift);",

			"return depth;",
		"}",

		// processing the sample, find r, b, g coloyur
		"vec3 color(vec2 coords, float blur) {", 
	
			"vec3 col = vec3(0.0);",

			"col.r = texture2D(tColor, coords + vec2(1.0, 1.0)* texel * blur).r;",
			"col.g = texture2D(tColor, coords + vec2(1.0, 1.0)* texel * blur).g;",
			"col.b = texture2D(tColor, coords + vec2(1.0, 1.0)* texel * blur).b;",

			"return col;", 
		"}",

		//debug the focus, would be nice to have on (This is taken from other example)
		"vec3 debugFocus(vec3 col, float blur, float depth) {",

			// distance based edge smoothing
			"float edge = 0.002 * depth;",
			"float m = clamp(smoothstep(0.0, edge, blur), 0.0, 1.0);",
			"float e = clamp(smoothstep(1.0 - edge, 1.0, blur), 0.0, 1.0);",

			"col = mix(col, vec3(1.0, 0.5, 0.0), (1.0 - m) * 0.6);",
			"col = mix(col, vec3(0.0, 0.5, 1.0), ((1.0 - e) - (1.0 - m)) * 0.2);",

			"return col;",
		"}",

		// generating noise/pattern texture for dithering, making the noise
		"vec2 rand(vec2 coord) {",

			"float noiseX = ((fract(1.0 - coord.s * (size.x / 2.0)) * 0.25) + (fract(coord.t * (size.y / 2.0)) * 0.75)) * 2.0 - 1.0;",
			"float noiseY = ((fract(1.0 - coord.s * (size.x / 2.0)) * 0.75) + (fract(coord.t * (size.y / 2.0)) * 0.25)) * 2.0 - 1.0;",

			"return vec2(noiseX,noiseY);",
		"}",

		//linearize the deoth to one value based on camera
		"float linearize(float depth) {",

			"return zfar * znear / (zfar - depth * (zfar - znear));",
		"}",
//************

		"void main() {",

		//finde depth value using unpack and linearize
			"float depth = linearize(unpackDepth(texture2D(tDepth, vUv)));",
	
		//find the hyper focal distance and near and far distances for depth 
			"float blur = 0.0;",
			"float hyper = (focalLength*focalLength)/(aperture*coc) + focalLength;",
			"hyper = hyper/1000.0;",
			"if (focalDepth >= hyper){",
				"dfar = 100000.0;",
				"dnear = (hyper/2.0);",
			"}",
			"else {",
				"dnear = ((hyper*focalDepth)/(hyper + (focalDepth- (focalLength)/1000.0)));",
				"dfar = ((hyper*focalDepth)/(hyper - (focalDepth- (focalLength)/1000.0)));",
			"}",

		   // DoF blur factor calculation based on how far from dnear and dfar
			"float a = depth - focalDepth;", // difference between the focus distance and depth value found above
											// If this value is postive than it is located past the focus distnace
											//If this vale is negative than it is located in front of focus dis
			//the distance between the depth and the dof edges is below
			// can maybe just do depth-dfar instead

			"float b = (a - (dfar-focalDepth)) / 5.0;", //blur for far 
			"float c = (-a - (focalDepth-dnear) )/ 5.0;", //blur for near

			//if find out what blur factor it is based on if it is infront or behind
			"blur = (a > 0.0) ? b : c;",
		
			//clamp between 0 or 1 
			"blur = clamp(blur, 0.0, 1.0);",

			// calculation of pattern for dithering
			"vec2 noise = rand(vUv) * namount * blur;",

			// getting blur x and y step factor
			"float w = (1.0 / size.x) * blur + noise.x;",
			"float h = (1.0 / size.y) * blur + noise.y;",


			// final color calculation (taken from other example to get working, moving to mine soon )
			// {
			"vec3 col = texture2D(tColor, vUv).rgb;",


	//TODO: GET THIS WORKING GUASSIAN BLUR

		// 	"vec2 texelsize = vec2(texel.x, texel.y) * size ;",

		// 	"float kernel[3];",
		// 	"kernel[0]=4.0/16.0; kernel[1]=2.0/16.0; kernel[2]=1.0/16.0;",
			
		// 	"for (int x=-1; x<2; x++) {",
		// 		"for (int y=-1; y<2; y++) {",
		// 			"vec2 offset = vUv + vec2(texelsize.x * float(x), texelsize.y * float(y));",
		// 			"float ker = float(kernel[(x*x + y*y)]);",
		// 			"col += color(offset, blur);",
		// 			//"col.r += tempr*kernel[(x*x + y*y)];",
		// 			//"col.g += tempg*kernel[(x*x + y*y)];",
		// 			//"col.b += tempb*kernel[(x*x + y*y)];",
		// 		"}",
		// 	//"}",
		// //	"return col;",
		// 	"}",
		// 	" col /= 9.0;",

//******* THIS is taken from other example, I am using to get mine working 
//I will put mine guassian blur in later
			"if (blur > 0.05) {",
			
				"float s = 1.0;",
				"const int max_i = 9;",

				"for (int i = 0; i < rings; ++i) {",
					
					"float float_i = float(i + 1);",
					"float ringsamples = float_i * float(samples);",
					
			 		"for (int j = 0; j < max_i; ++j) {",
						
			 			"float float_j = float(j);",

						"float step = 2.0 * PI / ringsamples;",
						"float pw = float_i * cos(float_j * step);",
						"float ph = float_i * sin(float_j * step);",
						
						"float p = 1.0;",
					
						"float m = p * mix(1.0, float_i / float(rings), bias);",
						"col += m * color(vUv + vec2(pw * w, ph * h), blur);",
						"s += m;",

						"if (j == 3 * (i + 1)) {",

							"break;",
						"}", 
					"}",
				"}",

				//divide by sample count
				"col /= s;", 
			"}",
			
			//	"col = debugFocus(col, blur, depth);",
//*************

			"gl_FragColor.rgb = col;",
			"gl_FragColor.a = 1.0;",
		"}"
	].join("\n")

};