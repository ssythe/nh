const BUBBLE_TIME = 6000

Game.on("playerJoin", (p) => {
    p.on("chatted", (msg) => {
        if (p.alive) {
            clearTimeout(p.bubbleTimer)
            p.setSpeech(msg)
            p.bubbleTimer = setTimeout(() => {
                p.setSpeech("")
            }, BUBBLE_TIME)
        }
    })
    p.on("died", () => {
        clearTimeout(p.bubbleTimer)
        p.setSpeech("")
    })
})