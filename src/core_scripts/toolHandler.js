Game.on("playerJoin", (p) => {
    p.keypress((key) => {
        if (!p.inventory.length) return

        key = parseInt(key)

        if (isNaN(key)) return

        const tool = p.inventory[key - 1]

        if (!tool || !tool.enabled) return

        p.equipTool(tool)
    })
})