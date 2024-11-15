export const SwirlPass = {
  name: "Swirl",

  uniforms: {
    scale: { value: 1.0 },
    smoothStepStart: { value: 1.0 },
    smoothStepEnd: { value: 1.0 },
    time: { value: 0.0 },
    delay: { value: 0.0 },
    displacement: { value: null },
    showWaves: { value: false },
    showRipples: { value: false },
    showGrain: { value: false },
  },

  vertexShader: /* glsl */ `

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,

  fragmentShader: /* glsl */ `

		uniform float scale;		
		uniform float delay;		
		uniform float time;		
		uniform float smoothStepStart;
		uniform float smoothStepEnd;	
		uniform bool showGrain;	
		uniform bool showRipples;	
		uniform bool showWaves;	

		uniform sampler2D grainTexture;
		uniform sampler2D displacement;

		varying vec2 vUv;

        vec4 bgColor = vec4(1., 0.97, 0.94, 1.);
        vec4 softOrange = vec4(0.976,0.624,0.443, 0.1);        
        vec4 orange = vec4(0.9556, 0.5010, 0.2745, 1.0);
        vec4 blue = vec4(0.73, 0.803, 0.901, 1.);
        

		float PI = 3.141592653589793238;

        /*  */
    
		void main() {
            vec2 newUv = vUv;

            vec2 p = 2. * vUv - vec2(1.);
            float timeSlow = time * 0.05;

            // Waves
            p += 0.17 * cos(scale * 3.7 * p.yx + 1.23 * timeSlow + delay * vec2(2.2,3.4));        
            p += 0.31 * cos(scale * 2.3 * p.yx + 5.5 * timeSlow + delay * vec2(3.2,1.3));            
            p += 0.31 * cos(scale * 4.3 * p.yx + 7.5 * timeSlow + delay * vec2(1.2,1.3));                        
			
            // Grain
            vec2 grainUv = vUv;
            grainUv *= vec2(25.,25.);
			float grain = texture( grainTexture, grainUv ).r;			
            grain *= smoothstep(0.3, 0.9, grain) *  0.1;            
            

			// Ripples
			vec4 disp = texture2D(displacement, vUv);
    		float theta = disp.r * 2.0 * PI;
    		vec2 dir = vec2(sin(theta), cos(theta));    		
    		p += dir * disp.r * 0.5;

			// Interpolate colors

            // Blue to orange / 0.244
            //float innerDist = smoothstep(smoothStepStart * 0.244, smoothStepEnd * 0.244, length(p) - grain);
            float innerDist = smoothstep(-0.4, .81, length(p) - grain);
            vec4 color = mix(softOrange, orange, innerDist);

            // Orange to bg
            //float dist = smoothstep(smoothStepStart, smoothStepEnd, length(p) + grain);
            float dist = smoothstep(smoothStepStart, smoothStepEnd, length(p) + grain);
            color = mix(color, bgColor, dist);

            if(showWaves) {
                gl_FragColor = vec4(length(p), 0.1, 0., 1.);
            } else if(showRipples) {
                gl_FragColor = texture(displacement, vUv);  
            } else if(showGrain) {
                gl_FragColor = texture( grainTexture, grainUv );
            } else {
                gl_FragColor = color;
            }
			



		}`,
};
