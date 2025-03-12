import {Application, Assets, Graphics, Sprite, RenderTexture, Point, Container, AnimatedSprite, Texture} from "pixi.js";

(async () => {
	const app = new Application();
	// globalThis.__PIXI_APP__ = app;

	await app.init({background: "#fc6a03", resizeTo: window});
	document.getElementById("pixi-container")!.appendChild(app.canvas);

	const brush = new Graphics().circle(0, 0, 50).fill({ color: 0xffffff });
	const line = new Graphics();

	await Assets.load(['./assets/frog2.png', './assets/sh.jpg']);

	const explosionTextures = [];
	let i;

	for (i = 0; i < 26; i++)
	{
		const texture = Texture.from(`./assets/frog2.png`);
		explosionTextures.push(texture);
	}

	for (i = 0; i < 100; i++)
	{
		// Create an explosion AnimatedSprite
		const explosion = new AnimatedSprite(explosionTextures);

		explosion.x = Math.random() * app.screen.width;
		explosion.y = Math.random() * app.screen.height;
		explosion.anchor.set(0.5);
		explosion.rotation = Math.random() * Math.PI;
		explosion.scale.set(0.75 + Math.random() * 0.5);
		explosion.gotoAndPlay((Math.random() * 26) | 0);
		app.stage.addChild(explosion);
	}


	const { width, height } = app.screen;
	const stageSize = { width, height };

	const background = new Container();
	const imageToReveal = Object.assign(Sprite.from('./assets/sh.jpg'), {width, height: 272* width/360});
	const renderTexture = RenderTexture.create(stageSize);
	const renderTextureSprite = new Sprite(renderTexture);

	imageToReveal.mask = renderTextureSprite;

	app.stage.addChild(background, imageToReveal, renderTextureSprite);
	app.stage.eventMode = 'static';
	app.stage.hitArea = app.screen;

	app.stage
		.on('pointerdown', pointerDown)
		.on('pointerup', pointerUp)
		.on('pointerupoutside', pointerUp)
		.on('pointermove', pointerMove);

	let dragging = false;
	let lastDrawnPoint: Point | null;

	function pointerMove({ global: { x, y } })
	{
		if (dragging)
		{
			brush.position.set(x, y);
			app.renderer.render({
				container: brush,
				target: renderTexture,
				clear: false,
				skipUpdateTransform: false,
			});
			// Smooth out the drawing a little bit to make it look nicer
			// this connects the previous drawn point to the current one
			// using a line
			if (lastDrawnPoint)
			{
				line.clear().moveTo(lastDrawnPoint.x, lastDrawnPoint.y).lineTo(x, y).stroke({ width: 100, color: 0xffffff });
				app.renderer.render({
					container: line,
					target: renderTexture,
					clear: false,
					skipUpdateTransform: false,
				});
			}
			lastDrawnPoint = lastDrawnPoint || new Point();
			lastDrawnPoint.set(x, y);
		}
	}

	function pointerDown(event)
	{
		dragging = true;
		pointerMove(event);
	}

	function pointerUp(event)
	{
		dragging = false;
		lastDrawnPoint = null;
	}

	app.start();


})();
