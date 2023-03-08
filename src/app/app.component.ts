import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule, AbstractControl } from '@angular/forms';

export class GlassGame  {
    public letterCount: number = 25;
    public playerCount: number = 1;
    public players : Array<GlassPlayer> = [];
    public wildcard : number = 0;
}

export class GlassPlayer {
    public order: number = 1;
    public playerItems : Array<GlassPlayerItem> = [];

    public name : string = "";
    public playTime : number = 150;
    public correctAnswers : number = 0;
    
}

export class GlassPlayerItem{
    public letter: string = "";
}

//regla del rosco
export class GlassPlayingRule{
    public categoryId: number = 0;
    public count: number = 0;
}

export enum GlassAnswerStatus {
  Pending = 0,
  Active = 1,
  Correct = 2,
  Error = 3,
  NextTime = 4
}


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent  implements OnInit {
  title(title: any) {
    throw new Error('Method not implemented.');
  }
  
  public game : GlassGame;

  public searchForm: FormGroup ;

  public availableLetter: string[] = [ "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "L", "M", "N", "Ñ", "O", "P", "Q", "R", "S", "T", "U", "V", "X", "Y", "Z"];

  public startedGame : boolean =false;
  
  dataList : any ;

  private interval:any;
  
  constructor(
    private _formBuilder: FormBuilder, 
  ) {

    this.game = this.getNewGame(0);
    this.game.playerCount = 2;
    console.log("Entré al cosntructor");
  }

  ngOnInit(): void {
     this.InitializeForm();
  }

  InitializeForm(): void{

    this.searchForm = this._formBuilder.group({

      player1               : ["Jugador 1", [Validators.required]],
      player2               : ["Jugador 2", [Validators.required]],
      seconds               : [140, [Validators.required]],
      playerCount           : [this.game.playerCount, [Validators.required]],
      wildcard              : [2, [Validators.required]],

      letterContains        : this._formBuilder.array([

      ]),

      players                : this._formBuilder.array([

      ])
    })
  }


  onStartGame():void{
    this.game.players =  [];
  
    for (let i=0; i < this.searchForm.get("playerCount")!.value; i++){
      let player = new GlassPlayer();
      player.name = i===0?this.searchForm.get("player1")!.value:this.searchForm.get("player2")!.value;
      player.order = i+1;
      player.playTime = (this.searchForm.get("seconds")!.value as number);
      player.playerItems = [];
      player.correctAnswers = 0;

      this.availableLetter.forEach(letter => {

        let item = new GlassPlayerItem();
        item.letter = letter;
        
        player.playerItems.push(item);
        
      });

      this.game.players.push(player);      
    }

    this.addPlayers(this.game.players);

    this.startedGame =true;
  }
  
  get players() {
    return this.searchForm.get('players') as FormArray;
  }
 
  addPlayers(players : Array<GlassPlayer>){
  
    players.forEach( p => {
      const player = this._formBuilder.group({
        order:  new FormControl(p.order, Validators.required),
        name:  new FormControl(p.name, Validators.required),
        active : new FormControl(p.order==1),
        playTime : new FormControl(p.playTime),
        correctAnswers : new FormControl(p.correctAnswers),
        failAnswers : new FormControl(0),
        isTimerPaused : new FormControl(true),
        gameOver : new FormControl(false),
        playerItems:  this._formBuilder.array([

        ]),
        wildcards        : this._formBuilder.array([

        ]),
      });

      let i = 1;
      p.playerItems.sort((a,b) => a.letter.localeCompare(b.letter)).forEach(item => {
        const playerItem = this._formBuilder.group({
          letter:   new FormControl(item.letter),
          status : new FormControl(i===1?GlassAnswerStatus.Active:GlassAnswerStatus.Pending),
          order : new FormControl(i)
        });
        i++;
        (player.get("playerItems") as FormArray).push(playerItem);
      });

      for (let w = 0; w < this.searchForm.get("wildcard")!.value; w++){
        const wildcard =  new FormControl(true);
        (player.get("wildcards") as FormArray).push(wildcard);
      }

      this.players.push(player);
    });

    console.log("this.players:", this.players);
  }

  deleteAllPlayers() {
    for (let i = this.players.length-1; i >= 0; i--) {
      this.deletePlayer(i);
    }
  }
  
  deletePlayer(indice: number) {
    this.players.removeAt(indice);
  }

  public getPlayerItems(item : any){
    return item.get('playerItems') as FormArray;
  }

  sortBy(array: FormArray ,prop: string) {
    return array.value.sort((a: any, b:any) => a[prop] > b[prop] ? 1 : a[prop] === b[prop] ? 0 : -1);
  }


  onStartPlay(gameIndex:number) {

    let player = this.players.at(gameIndex);
    player.get("isTimerPaused")!.setValue(!player.get("isTimerPaused")!.value);
   
    clearInterval(this.interval);
    this.interval = setInterval(() => {
      this.tick(gameIndex)
    }, 200);

   
  }

  onReduceTime(gameIndex:number){
    let player = this.players.at(gameIndex);
    let playTime = player.get("playTime")!.value;
    playTime--;
    player.get("playTime")!.setValue(playTime);
  }

  onAddTime(gameIndex:number){
    let player = this.players.at(gameIndex);
    let playTime = player.get("playTime")!.value;
    playTime++;
    player.get("playTime")!.setValue(playTime);
  }

  tick(gameIndex:number) :void{
    let player = this.players.at(gameIndex);
     
    if (!player.get("isTimerPaused")!.value){
      let playTime = player.get("playTime")!.value;
      playTime = playTime-0.2;
      if (playTime >= 0)
        player.get("playTime")!.setValue(playTime);
      else{
        player.get("isTimerPaused")!.setValue(true);
      }
    }
  }

  onNextPlayer(gameIndex:number){
    for (let i = 0; i<this.players.length; i++){
      let player = this.players.at(i);
      player.get("active")!.setValue(i===gameIndex);
      player.get("isTimerPaused")!.setValue(true);
    }
  }

  onWildCardChange(gameIndex:number, itemIndex : any){
    let player = this.players.at(gameIndex);
    (player.get("wildcards") as FormArray).at(itemIndex).setValue(!(player.get("wildcards") as FormArray).at(itemIndex).value);
  }

  onNextTime(gameIndex:number, itemIndex : number){
    let player = this.players.at(gameIndex);
    let item = this.getPlayerItems(player).at(itemIndex);

    this.recountAnswers(gameIndex);
    if  ( player.get("correctAnswers")!.value + player.get("failAnswers")!.value >=24 && 
      (this.getPlayerItems(player).at(itemIndex).get("status")!.value === GlassAnswerStatus.Active ||
      this.getPlayerItems(player).at(itemIndex).get("status")!.value === GlassAnswerStatus.Pending ||
      this.getPlayerItems(player).at(itemIndex).get("status")!.value === GlassAnswerStatus.NextTime 
      )){
        this.getPlayerItems(player).at(itemIndex).get("status")!.setValue(GlassAnswerStatus.Active);
    } else {
      item.get("status")!.setValue(GlassAnswerStatus.NextTime);
    }

    let nextItem = this.foundNextActiveLetter(itemIndex, player);

    if (nextItem !== undefined){
      nextItem.get("status")!.setValue(GlassAnswerStatus.Active);
    }

    this.recountAnswers(gameIndex);
    player.get("isTimerPaused")!.setValue(true);
  }

  onAnswer(gameIndex:number, itemIndex : number) {
    let player = this.players.at(gameIndex);
    let item = this.getPlayerItems(player).at(itemIndex);
    item.get("status")!.setValue(GlassAnswerStatus.Correct);

    let nextItem = this.foundNextActiveLetter(itemIndex, player);
    if (nextItem !== undefined){
      nextItem.get("status").setValue(GlassAnswerStatus.Active);
    }
    this.recountAnswers(gameIndex);
  }

  onChangeAnswer(gameIndex:number, itemIndex : number){
    let player = this.players.at(gameIndex);

    this.recountAnswers(gameIndex);

    if  ( player.get("correctAnswers")!.value + player.get("failAnswers")!.value >=24 && 
      (this.getPlayerItems(player).at(itemIndex).get("status")!.value === GlassAnswerStatus.Active ||
      this.getPlayerItems(player).at(itemIndex).get("status")!.value === GlassAnswerStatus.Pending ||
      this.getPlayerItems(player).at(itemIndex).get("status")!.value === GlassAnswerStatus.NextTime 
      )){
        this.getPlayerItems(player).at(itemIndex).get("status")!.setValue(GlassAnswerStatus.NextTime);
    }

    for (let i=0; i< (this.getPlayerItems(player).value as FormArray).length; i++){
      console.log("i:", this.getPlayerItems(player).at(i).value);
      if (this.getPlayerItems(player).at(i).get("status")!.value === GlassAnswerStatus.Active){
        this.getPlayerItems(player).at(i).get("status")!.setValue(GlassAnswerStatus.Pending);
      } 
    }

    let item = this.getPlayerItems(player).at(itemIndex);

    if (item.get("status")!.value === GlassAnswerStatus.Active) {
      item.get("status")!.setValue(GlassAnswerStatus.NextTime);
    } else if (item.get("status")!.value === GlassAnswerStatus.Pending) {
      item.get("status")!.setValue(GlassAnswerStatus.NextTime);
    }else if (item.get("status")!.value === GlassAnswerStatus.NextTime) {
      item.get("status")!.setValue(GlassAnswerStatus.Correct);
    } else if (item.get("status")!.value === GlassAnswerStatus.Correct) {
      item.get("status")!.setValue(GlassAnswerStatus.Error);
    } else if (item.get("status")!.value === GlassAnswerStatus.Error) {
      item.get("status")!.setValue(GlassAnswerStatus.Pending);
    } 

    let nextItem = this.foundNextActiveLetter(-1, player);
    if (nextItem !== undefined){
      nextItem.get("status").setValue(GlassAnswerStatus.Active);
    }
    this.recountAnswers(gameIndex);
  }

  onFail(gameIndex:number, itemIndex : number) {
    let player = this.players.at(gameIndex);
    let item = this.getPlayerItems(player).at(itemIndex);
    item.get("status")!.setValue(GlassAnswerStatus.Error);

    let nextItem = this.foundNextActiveLetter(itemIndex, player);
    if (nextItem !== undefined){
      nextItem.get("status").setValue(GlassAnswerStatus.Active);
    }
    this.recountAnswers(gameIndex);
    player.get("isTimerPaused")!.setValue(true);
  }

  recountAnswers(gameIndex:number){
    let player = this.players.at(gameIndex);
    let answers = 0;
    let fails = 0;
    for (let i=0; i< this.getPlayerItems(player).length;i++){
      let item = this.getPlayerItems(player).at(i);
      if (item.get("status")!.value === GlassAnswerStatus.Correct){
        answers++;
      }
      if (item.get("status")!.value === GlassAnswerStatus.Error){
        fails++;
      }
    }
    player.get("correctAnswers")!.setValue(answers);
    player.get("failAnswers")!.setValue(fails);
    player.get("gameOver")!.setValue(fails+answers==25);
  }
  
  foundNextActiveLetter(itemIndex : number, player: AbstractControl): any{
    let foundNext = false;
    let nextItem;
    for (let i=itemIndex+1; i < this.game.letterCount; i++){
      if (!foundNext && this.getPlayerItems(player).at(i).get("status")!.value === GlassAnswerStatus.Pending){
        nextItem = this.getPlayerItems(player).at(i);
        foundNext = true;
      }
    }

    if (!foundNext){
      
      for (let i=0; i < this.game.letterCount; i++){
        if (this.getPlayerItems(player).at(i).get("status")!.value === GlassAnswerStatus.NextTime){
          this.getPlayerItems(player).at(i).get("status")!.setValue(GlassAnswerStatus.Pending);
          
        }
      }

      for (let i=0; i < itemIndex; i++){
        if (!foundNext && this.getPlayerItems(player).at(i).get("status")!.value === GlassAnswerStatus.Pending){
          nextItem = this.getPlayerItems(player).at(i);
          foundNext = true;
        }
      }
    } 
    return nextItem;
  }

  private getNewGame(dictionaryId : number){
    var c = new GlassGame();
    c.players = [];
    c.letterCount = 25;
    c.playerCount = 1;
    return c;
  }
}
