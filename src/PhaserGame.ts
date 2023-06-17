import Phaser from 'phaser'

import { Bootstrap, GameScene } from './scenes'

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	parent: 'phaser-game',
	backgroundColor: 0x5df4f0,
	scale: {
		mode: Phaser.Scale.FIT,
		autoCenter: Phaser.Scale.CENTER_BOTH,
		width: window.innerWidth,
		height: window.innerHeight,
	},
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 0 },
			debug: true,
		},
	},
	scene: [Bootstrap, GameScene],
}
// eslint-disable-next-line import/no-anonymous-default-export
export default new Phaser.Game(config)