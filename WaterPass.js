WaterPass = function(resolution){

    THREE.Pass.call( this );

    let pars = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat };
    this.waterTargetH = new THREE.WebGLRenderTarget( resolution.x/2, resolution.y/2, pars );
    this.waterTargetH.texture.generateMipmaps = false;
    this.waterTargetV = new THREE.WebGLRenderTarget( resolution.x/2, resolution.y/2, pars );
    this.waterTargetV.texture.generateMipmaps = false;

    this.blurMaterial = new THREE.ShaderMaterial({
        uniforms:blurShader.uniforms,
        vertexShader:blurShader.vertexShader,
        fragmentShader:blurShader.fragmentShader
    });

    this.thresMaterial = new THREE.ShaderMaterial({
        uniforms:threShader.uniforms,
        vertexShader:threShader.vertexShader,
        fragmentShader:threShader.fragmentShader
    });

    this.camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
	this.scene  = new THREE.Scene();

	this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
	this.quad.frustumCulled = false; // Avoid getting clipped
	this.scene.add( this.quad );
    
    this.needsSwap = false;
};

WaterPass.prototype = Object.assign( Object.create( THREE.Pass.prototype ), {
    
    constructor: WaterPass,

    render: function( renderer, writeBuffer, readBuffer, delta, maskActive ) {
    
        this.quad.material = this.blurMaterial;
        this.blurMaterial.uniforms["tDiffuse"].value = readBuffer.texture;
        this.blurMaterial.uniforms["iResolution"].value = new THREE.Vector2(this.waterTargetH.width, this.waterTargetH.height);
        this.blurMaterial.uniforms["direction"].value = new THREE.Vector2(1,0);
        renderer.render( this.scene, this.camera, this.waterTargetH, true );

        this.blurMaterial.uniforms["tDiffuse"].value = this.waterTargetH.texture;
        this.blurMaterial.uniforms["direction"].value = new THREE.Vector2(0,1);
        renderer.render( this.scene, this.camera, this.waterTargetV, true );

        // threshold
        this.quad.material = this.thresMaterial;
        this.thresMaterial.uniforms["tDiffuse"].value = this.waterTargetV.texture;
        renderer.render( this.scene, this.camera);
    }

});
