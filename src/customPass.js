import {
	Vector2
} from 'three';

/**
 * Dot screen shader
 * based on glfx.js sepia shader
 * https://github.com/evanw/glfx.js
 */

const customPass = {

	name: 'CustomShader',

	uniforms: {
		'tDiffuse': { value: null },
		'tSize': { value: new Vector2( 256, 256 ) },
		'center': { value: new Vector2( 0.5, 0.5 ) },
		'angle': { value: 1.57 },
		'scale': { value: 1.0 },
		'smoothStepStart': { value: 1.0 },
		'smoothStepEnd': { value: 1.0 },
		'time': { value: 0.0 },
		'displacement': { value: null }
	},

	vertexShader: /* glsl */`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,

	fragmentShader: /* glsl */`

		uniform vec2 center;
		uniform float angle;
		uniform float scale;
		uniform float time;
		uniform float smoothStepStart;
		uniform float smoothStepEnd;
		uniform vec2 tSize;
		uniform sampler2D tDiffuse;
		uniform sampler2D grainTexture;
		uniform sampler2D displacement;
		varying vec2 vUv;

        vec4 bgColor = vec4(1., 0.97, 0.94, 1.);
        vec4 orange = vec4(0.9556, 0.5010, 0.2745, 1.0);
        vec4 blue = vec4(0.73, 0.803, 0.901, 1.);

		float PI = 3.141592653589793238;

        /*  */
    
		void main() {
            vec2 newUv = vUv;

            vec2 p = 2. * vUv - vec2(1.);
            float timeSlow = time * 0.05;

            // Waves
            p += 0.17 * cos(scale * 3.7 * p.yx + 1.23 * timeSlow + vec2(2.2,3.4));        
            p += 0.31 * cos(scale * 2.3 * p.yx + 3.5 * timeSlow + vec2(3.2,1.3));            
            p += 0.31 * cos(scale * 5.3 * p.xy + 7.5 * timeSlow + vec2(3.2,1.3));                        
			
            // Grain
            vec2 grainUv = vUv;
            grainUv *= vec2(20.,20.);
			float grain = texture( grainTexture, grainUv ).r;			
            grain *= smoothstep(0.3, 0.7, grain) *  0.1;

			// Ripples
			vec4 disp = texture2D(displacement, vUv);
    		float theta = disp.r * 2.0 * PI;
    		vec2 dir = vec2(sin(theta), cos(theta));    		
    		p += dir * disp.r * 0.5;

			// Interpolate colors

            // Blue to orange
            float innerDist = smoothstep(0.1, 0.21, length(p) - grain);
            vec4 color = mix(blue, orange, innerDist);

            // Orange to bg
            float dist = smoothstep(smoothStepStart, smoothStepEnd, length(p) + grain);
            color = mix(color, bgColor, dist);


			//gl_FragColor = texture(displacement, vUv);
			gl_FragColor = color;

		}`

};

export { customPass };
