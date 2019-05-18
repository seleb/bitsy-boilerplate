// Note that optimizations are written in terms of vanilla bitsy;
// many hacks may use gamedata which would otherwise be seen as "unused" in a vanilla bitsy game
// (e.g. a room may have no exits pointing to it, but still be used via exit-from-dialog tags),
// so be wary of this when choosing what to optimize

export default {
	rooms: false,    // removes unreachable rooms (except room 0)
	palettes: false, // removes unused palettes that aren't assigned to any rooms
	tiles: false,    // removes tiles that aren't placed in any rooms
	sprites: false,  // removes sprites that aren't placed in any rooms
	items: false,    // removes items that aren't placed in any rooms
	dialogue: false, // removes dialogue that isn't assigned to any sprites or items
	exits: false,    // removes exits that don't go to valid rooms
	endings: false,  // removes endings that aren't placed in any rooms
};
