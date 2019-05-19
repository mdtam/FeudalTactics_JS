package com.sesu8642.feudaltactics.gamestate.mapobjects;

import com.sesu8642.feudaltactics.gamestate.Kingdom;

public class Capital extends MapObject {

	private final String spriteName = "sprite_capital";
	private final int strength = 1;

	public Capital(Kingdom kingdom) {
		super(kingdom);
	}
	
	@Override
	public String getSpriteName() {
		return spriteName;
	}

	@Override
	public int getStrength() {
		return strength;
	}

}