// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * This file uses some code derived from Amits guide (https://www.redblobgames.com/grids/hexagons/implementation.html).
 * His code is licensed under CC0 as specified in one of his comments on the page as well as the header in the generated java code linked on the page.
 */

package de.sesu8642.feudaltactics.lib.gamestate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.badlogic.gdx.math.Vector2;

/**
 * Contains functions to get information about tiles. Uses two kinds of
 * coordinates: hex coordinates (Cube coordinates) - every tile has an integer
 * x, y and z coordinate. The z coordinate can and is calculated from the other
 * ones; world coordinates - x and y coordinates on the world map, e.g. where a
 * player clicked.
 **/
public class HexMapHelper {

	public static final float HEX_OUTER_RADIUS = 5;

	// prevent instantiation
	private HexMapHelper() {
		throw new AssertionError();
	}


	/**
	 * Takes fractional hex coordinates and returns the hex coordinates of the tile
	 * those are in.
	 * 
	 * @param coords fractional hex coordinates
	 * @return rounded hex coordinates
	 */
	public static Vector2 roundToHexCoords(Vector2 coords) {
		// https://www.redblobgames.com/grids/hexagons/#rounding
		// get third coordinate
		float cubeZ = -coords.x - coords.y;
		// round
		float x = Math.round(coords.x);
		float y = Math.round(coords.y);
		float z = Math.round(cubeZ);
		// find greatest difference from rounding and re-calculate it from the others
		float diffX = Math.abs(coords.x - x);
		float diffY = Math.abs(coords.y - y);
		float diffZ = Math.abs(cubeZ - z);

		if (diffX > diffY && diffX > diffZ) {
			x = -y - z;
		} else if (diffY < diffZ) {
			z = -x - y;
		}
		return new Vector2(x + 0.0F, z + 0.0F);
	}

	/**
	 * Returns the coordinates of all 12 tiles that are 2 tiles away from the given
	 * tile coordinates (neighbors' neighbors). Does not check if there are actually
	 * tiles on those positions.
	 * 
	 * @param tileCoords coordinates of the center tile
	 * @return neighbors' neighbors neighbor coordinates
	 */
	public static List<Vector2> getNeighborsNeighborCoords(Vector2 tileCoords) {
		ArrayList<Vector2> neighborsNeighbors = new ArrayList<>();
		neighborsNeighbors.add(new Vector2(tileCoords.x, tileCoords.y - 2));
		neighborsNeighbors.add(new Vector2(tileCoords.x + 1, tileCoords.y - 2));
		neighborsNeighbors.add(new Vector2(tileCoords.x + 2, tileCoords.y - 2));
		neighborsNeighbors.add(new Vector2(tileCoords.x + 2, tileCoords.y - 1));
		neighborsNeighbors.add(new Vector2(tileCoords.x + 2, tileCoords.y));
		neighborsNeighbors.add(new Vector2(tileCoords.x + 1, tileCoords.y + 1));
		neighborsNeighbors.add(new Vector2(tileCoords.x, tileCoords.y + 2));
		neighborsNeighbors.add(new Vector2(tileCoords.x - 1, tileCoords.y + 2));
		neighborsNeighbors.add(new Vector2(tileCoords.x - 2, tileCoords.y + 2));
		neighborsNeighbors.add(new Vector2(tileCoords.x - 2, tileCoords.y + 1));
		neighborsNeighbors.add(new Vector2(tileCoords.x - 2, tileCoords.y));
		neighborsNeighbors.add(new Vector2(tileCoords.x - 1, tileCoords.y - 1));
		return neighborsNeighbors;
	}

	public static List<HexTile> getNeighborsNeighborTiles(Map<Vector2, HexTile> map, HexTile tile) {
		return getNeighborsNeighborTiles(map, tile.getPosition());
	}

	private static List<HexTile> getNeighborsNeighborTiles(Map<Vector2, HexTile> map, Vector2 tileCoords) {
		List<Vector2> neighborsNeighborCoords = getNeighborsNeighborCoords(tileCoords);
		List<HexTile> neighborsNeighborTiles = new ArrayList<>();
		for (Vector2 coord : neighborsNeighborCoords) {
			neighborsNeighborTiles.add(map.get(coord));
		}
		return neighborsNeighborTiles;
	}
