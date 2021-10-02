import k from './kaboom.js'
import IntroScene from './scene/intro.js'

k.loadSprite('kinghuman', '/assets/sprites/kinghuman.png')
k.loadSprite('terrain', '/assets/sprites/terrain.png')

k.scene('intro', IntroScene)

k.scene('main', () => {
	const map = k.addLevel(
		[
			'    wwwwwwwwww',
			'    w     w  w',
			'    w        w',
			'wwwww        w',
			'w            w',
			'w            w',
			'wwwwwwwwwwwwww',
		],
		{
			width: 32,
			height: 32,
			w: () => [k.sprite('terrain'), k.area({ width: 32, height: 32, offset: k.vec2(-160, -352) }), k.solid()],
		},
	)

	k.add([k.sprite('kinghuman'), k.pos(map.getPos(8, 8)), k.origin('center'), k.area(), k.solid()])
})

k.go('intro')
