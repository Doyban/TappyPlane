import { SCORE, UI_ICONS_SCALE_FACTOR } from "../../utils/GameConstants";

/**
 * @class Gui
 * @description Creates all GUI related buttons/images and adds it to the scene.
 * @extends Phaser.GameObjects.Group
 */
export class Gui extends Phaser.GameObjects.Group {
  private gameOver: Phaser.GameObjects.Sprite | undefined = undefined;
  private getReady: Phaser.GameObjects.Sprite | undefined = undefined;
  private play: Phaser.GameObjects.Container | undefined = undefined;
  private playButton: Phaser.GameObjects.Sprite | undefined = undefined;
  private playButtonText: Phaser.GameObjects.Text | undefined = undefined;
  private scoreGroup: Phaser.GameObjects.Group;
  private menuGroup: Phaser.GameObjects.Group;
  private musicOn: Phaser.GameObjects.Sprite;
  private musicOff: Phaser.GameObjects.Sprite;
  private musicBtnBg!: Phaser.GameObjects.Sprite;


  /**
   * @constructor
   * @description Create a new instance of this class.
   * @param {Phaser.Scene} scene - scene object.
   */
  constructor(scene: Phaser.Scene) {
    super(scene);

    // Create score text.
    this.scoreGroup = this.scene.add.group();
    this.scene.data.set(SCORE, 0);
    this.createScoreText();

    // Create play button.
    this.play = this.scene.add.container(420, 240);
    this.playButton = this.createPlayButton();
    this.playButtonText = this.createPlayButtonText();
    this.play.add(this.playButton);
    this.play.add(this.playButtonText);
    this.add(this.play);
    
    this.menuGroup = this.scene.add.group();
    this.addMultiple(this.menuGroup.children.entries)
    this.createShop();
    this.createLoginButton();
    this.createShareButton();
    this.createFriendsButton();
    this.createCloseButton();
    // create soud controll assets
    this.musicOn = this.createMusicOn();
    this.musicOff = this.createMusicOff();
    // Create get ready sprite.
    this.getReady = this.scene.add.sprite(
      420,
      -50,
      "sheet",
      "textGetReady.png"
    );
    this.add(this.getReady);

    // Create game over sprite.
    this.gameOver = this.scene.add.sprite(
      420,
      -50,
      "sheet",
      "textGameOver.png"
    );
    this.add(this.gameOver);

    // Event listeners.
    this.scene.events.on("changedata", this.onDataChange, this);
    this.scene.events.on("getReady", this.onGetReady, this);
    this.scene.events.on("reset", this.onReset, this);
  }

  /**
   * @access private
   * @description Create play button.
   * @function createPlayButton
   * @returns {Phaser.GameObjects.Sprite} play_button
   */
  private createPlayButton(): Phaser.GameObjects.Sprite {
    const play_button = this.scene.add.sprite(0, 0, "sheet", "buttonLarge.png");

    // Use the hand cursor for play button.
    play_button.setInteractive({
      useHandCursor: true,
    });

    play_button.on(
      "pointerdown",
      () => {
        if (this.play) this.play.setVisible(false); // Set the play button to be invisible once game has started.
        this.menuGroup.children.entries.forEach((child: any) => {
          child.setVisible(false); // Set each child to be invisible.
        });
        this.musicOn.setVisible(true)
        this.musicBtnBg.setVisible(true)
        this.scene.events.emit("getReady"); // Emit "getReady" event on this scene.
      },
      this // Context which is a reference to GameOver object in this case.
    );

    return play_button;
  }

  /**
   * @access private
   * @description Create play button text.
   * @function createPlayButton
   * @returns {Phaser.GameObjects.Text} play_button_text
   */
  private createPlayButtonText(): Phaser.GameObjects.Text {
    const play_button_text: Phaser.GameObjects.Text = this.scene.add.text(
      0,
      -5,
      "play"
    );

    play_button_text.setOrigin(0.5);
    play_button_text.setFont("Calistoga");
    play_button_text.setFontSize(50);
    play_button_text.setShadow(2, 2, "#000000", 0.5, true, false);

    return play_button_text;
  }

  /**
   * @access private
   * @description Listens to data changes and update the value.
   * @function onDataChange
   * @param {any} parent Game object which is caused by change.
   * @param {string} key Key which got changed.
   * @param {any} value New value which has inserted.
   * @param {any} previousValue Value which is replaced.
   * @returns {void}
   */
  private onDataChange(
    parent: any, // Even though this parameter is not being used it must be here to change the ground.
    key: string,
    value: any,
    previousValue: any // Even though this parameter is not being used it must be here to change the ground.
  ): void {
    // Check if the changed data refers to score.
    if (key === SCORE) {
      this.updateScore(value); // Update score.
    }
  }

  /**
   * @access private
   * @description Update score of the game.
   * @function updateScore
   * @param {number} value
   * @returns {void}
   */
  private updateScore(value: number): void {
    const changeEnvironemntScore: number = 5;

    // Check if Plane reached already enough score to change frames of environment for Ground and Rocks.
    if (value === changeEnvironemntScore) {
      this.scene.events.emit("changeenv"); // Emit "changeenv" event on this scene.
    }

    // Set variables to update score.
    const score: string = value.toString();
    const score_digits: string[] = score.split("");
    const score_length: number = score.length;

    // Show the digits depending on score length.
    for (let i = 1; i <= score_length; i++) {
      const score_group_child: any = this.scoreGroup.children.entries[i - 1];
      if (score_group_child) {
        score_group_child.setFrame(`number${score_digits[i - 1]}.png`);
        if (!score_group_child.visible) {
          score_group_child.setVisible(true);
        }
      }
    }
  }

  /**
   * @access private
   * @description Add get ready tween animation to the tween manager.
   * @function onGetReady
   * @returns {void}
   */
  private onGetReady(): void {
    this.scene.tweens.add({
      targets: this.getReady,
      y: 60,
      ease: "Back.easeOut",
      yoyo: true,
      duration: 2000,
      hold: 500,
      onComplete: this.onGetReadyComplete, // Callback method.
      onCompleteScope: this, // Context which is a reference to GameOver object in this case.
    });
  }

  /**
   * @access private
   * @callback onGetReadyComplete
   * @description Listens to the oncomplete event of get ready tween animation.
   * @returns {void}
   */
  private onGetReadyComplete(): void {
    this.scene.data.set("isPlayDown", true); // Set get ready tween animation as done.
  }

  /**
   * @access private
   * @description Listens to reset event.
   * @function onReset
   * @returns {void}
   */
  private onReset(): void {
    // Reset the score group children.
    this.scoreGroup.children.entries.forEach((child: any) => {
      child.setVisible(false); // Set each child to be invisible.
      if (child.name == "musicbg" ) child.setVisible(true);
      if (child.name == "" && child.data && child.data.get("clicked")){
        console.log('child :>> ', child);
        child.setVisible(true)
      };
    });
    // Reset the menu group children.
    this.menuGroup.children.entries.forEach((child: any) => {
      child.setVisible(false); // Set each child to be visible.
    });
    this.scene.data.set(SCORE, 0); // Set initial score to be '0'.
  }

  /**
   * @access private
   * @description Create score text.
   * @function createScoreText
   * @returns {void}
   */
  private createScoreText(): void {
    let x: number = 30;

    // Create the max digits possible for score, add them to the scene and make it invisible (will make it visible if score length matches it).
    for (let i = 0; i < 6; i++) {
      const score_text: Phaser.GameObjects.Image = this.scene.add.image(
        x,
        40,
        "sheet",
        "number0.png"
      );

      score_text.setName(`score_index${i}`);
      score_text.setScale(0.6);
      score_text.setVisible(false);
      score_text.setDepth(5); // Depth of this game object within this scene (rendering position), also known as 'z-index' in CSS.
      this.scoreGroup.add(score_text);
      x += 35; // Once score length expands then make some space for next numbers.
    }

    // Add all the individual score texts to one group.
    this.scoreGroup.children.entries.forEach((child: any) => {
      if (child.name === "score_index0") {
        child.setVisible(true);
      } else {
        child.setVisible(false);
      }
    });
  }

  /**
   * @access private
   * @description Create shop button.
   * @function createMenu
   */
  private createShop(): void {
    const shop_button = this.scene.add.sprite(+this.scene.game.config.width * 0.25, +this.scene.game.config.height * 0.76, "ui_buttons", "yellow_button12.png");
    const shop_icon = this.scene.add.sprite(+this.scene.game.config.width * 0.25, +this.scene.game.config.height * 0.76, "ui_icons", "cart.png");

    shop_button.scale = shop_icon.scale = UI_ICONS_SCALE_FACTOR;
    // Use the hand cursor for shop button.
    shop_button.setInteractive({
      useHandCursor: true,
    });

    shop_button.on(
      "pointerdown",
      () => {
        alert("shop clicked")
      },
      this // Context which is a reference to GameOver object in this case.
    );
    this.menuGroup.add(shop_icon);
    this.menuGroup.add(shop_button);
  }

  /**
   * @access private
   * @description Create login button.
   * @function createMenu
   */
  private createLoginButton(): void {
    const login_button = this.scene.add.sprite(+this.scene.game.config.width * 0.42, +this.scene.game.config.height * 0.76, "ui_buttons", "yellow_button12.png");
    const login_icon = this.scene.add.sprite(+this.scene.game.config.width * 0.42, +this.scene.game.config.height * 0.76, "ui_icons", "singleplayer.png");

    login_button.scale = login_icon.scale = UI_ICONS_SCALE_FACTOR;

    // Use the hand cursor for play button.
    login_button.setInteractive({
      useHandCursor: true,
    });

    login_button.on(
      "pointerdown",
      () => {
        alert("login button clicked")
      },
      this // Context which is a reference to GameOver object in this case.
    );
    this.menuGroup.add(login_icon);
    this.menuGroup.add(login_button);
  }

  /**
   * @access private
   * @description Create share button.
   * @function createMenu
   */
  private createShareButton(): void {
    const share_button = this.scene.add.sprite(+this.scene.game.config.width * 0.62, +this.scene.game.config.height * 0.76, "ui_buttons", "yellow_button12.png");
    const share_icon = this.scene.add.sprite(+this.scene.game.config.width * 0.62, +this.scene.game.config.height * 0.76, "ui_icons", "share2.png");

    share_button.scale = share_icon.scale = UI_ICONS_SCALE_FACTOR;

    // Use the hand cursor for play button.
    share_button.setInteractive({
      useHandCursor: true,
    });

    share_button.on(
      "pointerdown",
      () => {
        alert("share button clicked")
      },
      this // Context which is a reference to GameOver object in this case.
    );
    this.menuGroup.add(share_button);
    this.menuGroup.add(share_icon);
  }

  /**
   * @access private
   * @description Create friends button.
   * @function createMenu
   */
  private createFriendsButton(): void {
    const friends_button = this.scene.add.sprite(+this.scene.game.config.width * 0.79, +this.scene.game.config.height * 0.76, "ui_buttons", "yellow_button12.png");
    const friends_icon = this.scene.add.sprite(+this.scene.game.config.width * 0.79, +this.scene.game.config.height * 0.76, "ui_icons", "multiplayer.png");

    friends_button.scale = friends_icon.scale = UI_ICONS_SCALE_FACTOR;

    // Use the hand cursor for play button.
    friends_button.setInteractive({
      useHandCursor: true,
    });

    friends_button.on(
      "pointerdown",
      () => {
        alert("friends button clicked")
      },
      this // Context which is a reference to GameOver object in this case.
    );
    this.menuGroup.add(friends_icon);
    this.menuGroup.add(friends_button);
  }
  
  /**
   * @access private
   * @description Create musicon button.
   * @function createMenu
   */
   private createMusicOn(): Phaser.GameObjects.Sprite {
    this.musicBtnBg = this.scene.add.sprite(+this.scene.game.config.width - 50, 50, "ui_buttons", "yellow_button12.png");
    const music_on = this.scene.add.sprite(+this.scene.game.config.width - 50, 50, "musicOn");
    music_on.setVisible(false);
    music_on.setDepth(5);
    music_on.setDataEnabled();
    music_on.data.set("clicked", false)
    this.musicBtnBg.setName("musicbg")
    this.musicBtnBg.setVisible(false);
    this.musicBtnBg.setDepth(5);

    this.musicBtnBg.scale = music_on.scale = UI_ICONS_SCALE_FACTOR;

    // Use the hand cursor for shop button.
    music_on.setInteractive({
      useHandCursor: true,
    });

    music_on.on(
      "pointerdown",
      () => {
        music_on.data.set("clicked", false)
        this.scene.sound.mute = true;
        this.musicOff.setVisible(true);
        this.musicOff.data.set("clicked", true);
        music_on.setVisible(false);
      },
      this // Context which is a reference to GameOver object in this case.
    );
    this.scoreGroup.add(this.musicBtnBg)
    this.scoreGroup.add(music_on)
    return music_on
  }
  
  /**
   * @access private
   * @description Create musicoff button.
   * @function createMenu
   */
   private createMusicOff(): Phaser.GameObjects.Sprite {
    const music_off = this.scene.add.sprite(+this.scene.game.config.width - 50, 50, "musicOff");
    music_off.setVisible(false)
    music_off.setDepth(5)
    music_off.setDataEnabled();

    music_off.scale = UI_ICONS_SCALE_FACTOR;

    // Use the hand cursor for shop button.
    music_off.setInteractive({
      useHandCursor: true,
    });

    music_off.on(
      "pointerdown",
      () => {
        music_off.data.set("clicked", false)
        this.scene.sound.mute = false;
        this.musicOn.setVisible(true);
        this.musicOn.data.set("clicked", true);
        music_off.setVisible(false);      
      },
      this // Context which is a reference to GameOver object in this case.
    );
    this.scoreGroup.add(music_off)
    return music_off
  }

  
  /**
   * @access private
   * @description Create game close button.
   * @function createCloseButton
   */
   private createCloseButton(): void {
    const close_button = this.scene.add.sprite(+this.scene.game.config.width - 50, 50, "ui_buttons", "yellow_button12.png");
    const close_icon = this.scene.add.sprite(+this.scene.game.config.width - 50, 50, "ui_icons", "cross.png");

    close_button.scale = close_icon.scale = UI_ICONS_SCALE_FACTOR;

    // Use the hand cursor for play button.
    close_button.setInteractive({
      useHandCursor: true,
    });

    close_button.on(
      "pointerdown",
      () => {
        alert("close button clicked")
      },
      this // Context which is a reference to GameOver object in this case.
    );
    this.menuGroup.add(close_icon);
    this.menuGroup.add(close_button);
  }
}
