import restart from "vite-plugin-restart";
import glsl from "vite-plugin-glsl";

export default {
  server: {
    host: true, // Open to local network and display URL
  },
  plugins: [
    restart({ restart: ["./public/**"] }), // Resatart server on static file change
    glsl(), // Handle shader files
  ],
};
