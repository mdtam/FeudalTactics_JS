package com.sesu8642.feudaltactics.gamelogic;

import java.util.ArrayList;

import javax.inject.Inject;
import javax.inject.Singleton;

import com.badlogic.gdx.Gdx;
import com.badlogic.gdx.graphics.Color;
import com.badlogic.gdx.math.Vector2;
import com.google.common.eventbus.EventBus;
import com.sesu8642.feudaltactics.BotAi;
import com.sesu8642.feudaltactics.MapRenderer;
import com.sesu8642.feudaltactics.dagger.qualifierannotations.IngameRenderer;
import com.sesu8642.feudaltactics.events.GameStateChangeEvent;
import com.sesu8642.feudaltactics.gamelogic.gamestate.GameState;
import com.sesu8642.feudaltactics.gamelogic.gamestate.GameStateHelper;
import com.sesu8642.feudaltactics.gamelogic.gamestate.HexTile;
import com.sesu8642.feudaltactics.gamelogic.gamestate.Kingdom;
import com.sesu8642.feudaltactics.gamelogic.gamestate.Player;
import com.sesu8642.feudaltactics.gamelogic.gamestate.Player.Type;
import com.sesu8642.feudaltactics.preferences.PreferencesHelper;

/** Controller for playing the game. */
@Singleton
public class GameController {

	private static final String TAG = GameController.class.getName();

	private static final Color[] PLAYER_COLORS = { new Color(0.2F, 0.45F, 0.8F, 1), new Color(0.75F, 0.5F, 0F, 1),
			new Color(1F, 0.67F, 0.67F, 1), new Color(1F, 1F, 0F, 1), new Color(1F, 1F, 1F, 1),
			new Color(0F, 1F, 0F, 1) };

	private EventBus eventBus;
	private MapRenderer mapRenderer;
	private BotAi botAi;
	private GameState gameState;

	/**
	 * Constructor.
	 * 
	 * @param eventBus    event bus
	 * @param mapRenderer map renderer
	 * @param botAi       bot AI
	 */
	@Inject
	public GameController(EventBus eventBus, @IngameRenderer MapRenderer mapRenderer, BotAi botAi) {
		this.eventBus = eventBus;
		this.mapRenderer = mapRenderer;
		this.botAi = botAi;
		gameState = new GameState();
	}

	/** Starts the game. Bots will do their turns if they are first. */
	public void startGame() {
		// if a bot begins, make it act
		if (gameState.getActivePlayer().getType() == Type.LOCAL_BOT) {
			gameState = botAi.doTurn(gameState, gameState.getBotIntelligence());
			endTurn();
		}
		PreferencesHelper.deleteAllAutoSaveExceptLatestN(0);
		autosave();
		eventBus.post(new GameStateChangeEvent(gameState));
	}

	private void autosave() {
		PreferencesHelper.autoSaveGameState(gameState);
	}

	/** Loads the latest autosave. */
	public void loadLatestAutosave() {
		gameState = PreferencesHelper.getLatestAutoSave();
		mapRenderer.updateMap(gameState);
		eventBus.post(new GameStateChangeEvent(gameState));
	}

	/**
	 * Generates a map.
	 * 
	 * @param humanPlayerNo   number of human players that play
	 * @param botPlayerNo     number of bot players that play
	 * @param botIntelligence intelligence of the bot players
	 * @param seed            map seed to use for generating the map
	 * @param landMass        number of tiles to generate
	 * @param density         map density to use for generation
	 */
	public void generateMap(int humanPlayerNo, int botPlayerNo, BotAi.Intelligence botIntelligence, Long seed,
			float landMass, float density) {
		gameState = new GameState();
		gameState.setBotIntelligence(botIntelligence);
		ArrayList<Player> players = new ArrayList<>();
		int remainingHumanPlayers = humanPlayerNo;
		int remainingBotPlayers = botPlayerNo;
		for (Color color : PLAYER_COLORS) {
			if (remainingHumanPlayers > 0) {
				remainingHumanPlayers--;
				players.add(new Player(color, Type.LOCAL_PLAYER));
			} else if (remainingBotPlayers > 0) {
				players.add(new Player(color, Type.LOCAL_BOT));
			} else {
				break;
			}
		}
		GameStateHelper.initializeMap(gameState, players, landMass, density, null, seed);
		mapRenderer.updateMap(gameState);
		eventBus.post(new GameStateChangeEvent(gameState));
	}

	/**
	 * Prints debug info about a tile.
	 * 
	 * @param hexCoords coords of the tile
	 */
	public void printTileInfo(Vector2 hexCoords) {

		Gdx.app.debug(TAG, String.format("clicked tile position %s: %s", hexCoords,
				String.valueOf(gameState.getMap().getTiles().get(hexCoords))));
	}

	/**
	 * Activates a kingdom.
	 * 
	 * @param kingdom kingdom to activate
	 */
	public void activateKingdom(Kingdom kingdom) {
		GameStateHelper.activateKingdom(gameState, kingdom);
		mapRenderer.updateMap(gameState);
		autosave();
		// save first because is is relevant for the undo button status
		eventBus.post(new GameStateChangeEvent(gameState));
	}

	/**
	 * Picks up an object.
	 * 
	 * @param tile tile that contains the object
	 */
	public void pickupObject(HexTile tile) {
		GameStateHelper.pickupObject(gameState, tile);
		mapRenderer.updateMap(gameState);
		autosave();
		eventBus.post(new GameStateChangeEvent(gameState));
	}

	/**
	 * Places a held object on a tile in the own kingdom.
	 * 
	 * @param tile tile to place to object on
	 */
	public void placeOwn(HexTile tile) {
		GameStateHelper.placeOwn(gameState, tile);
		mapRenderer.updateMap(gameState);
		autosave();
		eventBus.post(new GameStateChangeEvent(gameState));
	}

	/**
	 * Combines the held unit with a unit on the map.
	 * 
	 * @param tile tile that contains the unit on the map
	 */
	public void combineUnits(HexTile tile) {
		GameStateHelper.combineUnits(gameState, tile);
		mapRenderer.updateMap(gameState);
		autosave();
		eventBus.post(new GameStateChangeEvent(gameState));
	}

	/**
	 * Conquers an enemy tile.
	 * 
	 * @param tile tile to conquer
	 */
	public void conquer(HexTile tile) {
		GameStateHelper.conquer(gameState, tile);
		mapRenderer.updateMap(gameState);
		autosave();
		eventBus.post(new GameStateChangeEvent(gameState));
	}

	/** Ends the turn. */
	public void endTurn() {
		// remember old winner
		Player oldWinner = gameState.getWinner();
		// update gameState
		gameState = GameStateHelper.endTurn(gameState);
		mapRenderer.updateMap(gameState);
		// make bots act
		if (gameState.getActivePlayer().getType() == Type.LOCAL_BOT) {
			gameState = botAi.doTurn(gameState, gameState.getBotIntelligence());
			endTurn();
		} else {
			// autosave when a player turn begins
			autosave();
			// clear autosaves from previous turn
			PreferencesHelper.deleteAllAutoSaveExceptLatestN(1);
			eventBus.post(new GameStateChangeEvent(gameState, gameState.getWinner() != oldWinner));
		}
	}

	/** Buys a peasant. */
	public void buyPeasant() {
		GameStateHelper.buyPeasant(gameState);
		mapRenderer.updateMap(gameState);
		autosave();
		eventBus.post(new GameStateChangeEvent(gameState));
	}

	/** Buys a castle. */
	public void buyCastle() {
		GameStateHelper.buyCastle(gameState);
		mapRenderer.updateMap(gameState);
		autosave();
		eventBus.post(new GameStateChangeEvent(gameState));
	}

	/** Undoes the last action. */
	public void undoLastAction() {
		if (PreferencesHelper.getNoOfAutoSaves() > 1) {
			// 1 means the current state is the only one saved
			// remove the current state from autosaves
			PreferencesHelper.deleteLatestAutoSave();
			// load the previous state
			GameState loaded = PreferencesHelper.getLatestAutoSave();
			gameState = loaded;
			mapRenderer.updateMap(gameState);
		}
		eventBus.post(new GameStateChangeEvent(gameState));
	}

	public void placeCameraForFullMapView(long marginLeftPx, long marginBottomPx, long marginRightPx,
			long marginTopPx) {
		mapRenderer.placeCameraForFullMapView(gameState, marginLeftPx, marginBottomPx, marginRightPx, marginTopPx);
	}

	public MapRenderer getMapRenderer() {
		return mapRenderer;
	}

	public GameState getGameState() {
		return gameState;
	}
}