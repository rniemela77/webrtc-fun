module.exports = {
  server: {
	baseDir: "public",
	routes: {
	  "/node_modules": "node_modules"
	}
  },
  files: ["public/**/*.*"],
  port: 3000,
  open: false,
  notify: false
};