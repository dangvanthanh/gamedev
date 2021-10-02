import k from '../kaboom.js'

export default function IntroScreen() {
	k.add([k.text('Press space to begin', 3), k.pos(k.width() / 2, k.height() / 2), k.origin('center')])

	k.keyPress('space', () => {
		k.go('main')
	})
}
