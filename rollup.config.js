import babel from 'rollup-plugin-babel';
import glslify from 'glslify';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

function glsl() {
	return {
		transform( code, id ) {

            if ( /\.glsl$/.test( id ) === false ) return;
            //
            const res = glslify( code );
            //

			var transformedCode = 'export default ' + JSON.stringify(
				res
					.replace( /[ \t]*\/\/.*\n/g, '' ) // remove //
					.replace( /[ \t]*\/\*[\s\S]*?\*\//g, '' ) // remove /* */
					.replace( /\n{2,}/g, '\n' ) // # \n+ to \n
			) + ';';
			return {
				code: transformedCode,
				map: { mappings: '' }
			};
		}
	};
}

export default {
	input: 'src/main.js',
	plugins: [
		resolve(),
		commonjs(),
        glsl(),
        babel( {
            // if this option is true, babel does some minification of files once they reach a certain size
            compact: false,
            // exclude node modules AND any folders that you keep .glsl files in
            // alternatively you could just 'include' relevant folders instead
            exclude: ['node_modules/**', 'src/shaders/**']
          } )
	],
	output: [
		{
			format: 'iife',
			name: 'viewer',
			file: 'viewer.js',
			indent: '\t'
		}
	]
};