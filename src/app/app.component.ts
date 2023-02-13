import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule, AbstractControl } from '@angular/forms';

export class GlassGame  {
    public id: number | undefined;
    public code: string | undefined;
    public createdDate: Date  | undefined;
    public createdUserId: number | undefined;
    public modifiedDate: Date | undefined;
    public modifiedUserId: number | undefined;
    public isChild: boolean | undefined;

    public name : string="";
    public subtitle: string = "";
    public letterCount: number = 25;
    public playerCount: number = 1;
    public dictionaryId: number = 0;

    public playingRules : Array<GlassPlayingRule> = [];
    public letterContains : Array<string> = [];
    public players : Array<GlassPlayer> = [];
    public save: boolean = false;
    public pageCount: number = 1;

    public allLetters: boolean = true;      //completar con las 25 letras
    public maxDefinitionLen: number = 0;    //Cantidad maxima de caracteres por definicion
    public maxWordCount: number = 0;        //Cantidad máxima de palabras en el rosco
    public includeTesting: boolean = false;
    public onlyNewDefinitions : boolean = false;
    public sharedWith : Array<number> = [];
    public exportToExcell : boolean =false;

    public wildcard : number = 0;
}

export class GlassPlayer {
    public order: number = 1;
    public playerItems : Array<GlassPlayerItem> = [];
    public wordCount: number = 0;

    public name : string = "";
    public playTime : number = 150;
    public correctAnswers : number = 0;
    
}

//defnición del rosco
export class GlassPlayerItem{
    public letter: string = "";
    public isContain: boolean = false;
    public definitionId: number = 0;
    public categoryId: number = 0;
    public definitionLetersCount: number = 0; // cantidad de letras de la definición
    public definitionWordsCount: number = 0; // Cantidad de palabras de las definición
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
  
 // listComponent : Type<any>  = ListComponentComponent ;
  dataList : any ;

  private interval:any;
  
  constructor(
    private _formBuilder: FormBuilder, 
  ) {

    this.game = this.getNewGame(0);
    this.game.playerCount = 2;
    //this.InitializeForm();
  }

  ngOnInit(): void {
     this.InitializeForm();
  }

  InitializeForm(): void{

    this.searchForm = this._formBuilder.group({

      player1               : ["Jugador 1", [Validators.required]],
      player2               : ["Jugador 2", [Validators.required]],
      seconds               : [150, [Validators.required]],
      playerCount           : [this.game.playerCount, [Validators.required]],
      allLetters            : [this.game.allLetters, [Validators.required]],
      wildcard              : [3, [Validators.required]],

    //  wildcards        : this._formBuilder.array([
        //this._formBuilder.control('')
     // ]),

      letterContains        : this._formBuilder.array([
        //this._formBuilder.control('')
      ]),

      players                : this._formBuilder.array([
        //this._formBuilder.control('')
      ])
    })
  }


  onStartGame():void{
    //console.log("Empece:", this.searchForm.get("playerCount").value);
    this.game.players =  [];

    
      for (let i=0; i < this.searchForm.get("playerCount")!.value; i++){
        let player = new GlassPlayer();
        player.name = i===0?this.searchForm.get("player1")!.value:this.searchForm.get("player2")!.value;
        player.order = i+1;
        player.playTime = (this.searchForm.get("seconds")!.value as number);
       // player.wildcard = (this.searchForm.get("wildcard").value as number);
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
  
    

    //this._menuService.SetHeaderTitle("Jugando: "+this.searchForm.get("player1").value);

    this.startedGame =true;
  }
  
  get players() {
    return this.searchForm.get('players') as FormArray;
  }

 /* get wildcards() {
    return this.searchForm.get('wildcards') as FormArray;
  }*/
 
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
        playerItems:  this._formBuilder.array([
          //this._formBuilder.control('')
        ]),
        wildcards        : this._formBuilder.array([
          //this._formBuilder.control('')
        ]),
      });

      let i = 1;
      p.playerItems.sort((a,b) => a.letter.localeCompare(b.letter)).forEach(item => {
        
        const playerItem = this._formBuilder.group({
          isContain:   new FormControl(item.isContain),
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
   /* let player = this.players.at(gameIndex);
    let item = this.getPlayerItems(player).at(itemIndex);
    item.get("status").setValue(GlassAnswerStatus.Correct);

    let nextItem = this.foundNextActiveLetter(itemIndex, player);
    nextItem.get("status").setValue(GlassAnswerStatus.Active);*/
    //isTimerPaused
    let player = this.players.at(gameIndex);
    player.get("isTimerPaused")!.setValue(!player.get("isTimerPaused")!.value);

   
    clearInterval(this.interval);
    this.interval = setInterval(() => {
      this.tick(gameIndex)
    }, 200);

   /* if (player.get("isTimerPaused").value){
      clearInterval(interval);
    };*/
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
     /* if (i===gameIndex){
        this._menuService.SetHeaderTitle("Jugando: "+player.get("name").value);
      }*/

      player.get("isTimerPaused")!.setValue(true);
    }
    
  }

  onWildCardChange(gameIndex:number, itemIndex : any){
    let player = this.players.at(gameIndex);
    (player.get("wildcards") as FormArray).at(itemIndex).setValue(!(player.get("wildcards") as FormArray).at(itemIndex).value);
    console.log(" wildcards:",player.get("wildcards")!.value, " W:", itemIndex);
  }

  onNextTime(gameIndex:number, itemIndex : number){
    let player = this.players.at(gameIndex);
    let item = this.getPlayerItems(player).at(itemIndex);
    console.log("Juego: ", gameIndex, " ItemIndex:", itemIndex," player:", player.value, " Items:", item.value);
    item.get("status")!.setValue(GlassAnswerStatus.NextTime);

    let nextItem = this.foundNextActiveLetter(itemIndex, player);

    nextItem.get("status").setValue(GlassAnswerStatus.Active);

    this.recountAnswers(gameIndex);
    player.get("isTimerPaused")!.setValue(true);
  }

  onAnswer(gameIndex:number, itemIndex : number) {
    let player = this.players.at(gameIndex);
    let item = this.getPlayerItems(player).at(itemIndex);
    item.get("status")!.setValue(GlassAnswerStatus.Correct);

    let nextItem = this.foundNextActiveLetter(itemIndex, player);
    nextItem.get("status").setValue(GlassAnswerStatus.Active);
    this.recountAnswers(gameIndex);
  }

  onChangeAnswer(gameIndex:number, itemIndex : number){
    let player = this.players.at(gameIndex);

    for (let i=0; i< (this.getPlayerItems(player).value as FormArray).length; i++){
      console.log("i:", this.getPlayerItems(player).at(i).value);
      if (this.getPlayerItems(player).at(i).get("status")!.value === GlassAnswerStatus.Active){
        this.getPlayerItems(player).at(i).get("status")!.setValue(GlassAnswerStatus.Pending);
      } 
    }

    let item = this.getPlayerItems(player).at(itemIndex);

    if (item.get("status")!.value === GlassAnswerStatus.Pending) {
      item.get("status")!.setValue(GlassAnswerStatus.NextTime);
    }else if (item.get("status")!.value === GlassAnswerStatus.NextTime) {
      item.get("status")!.setValue(GlassAnswerStatus.Correct);
    } else if (item.get("status")!.value === GlassAnswerStatus.Correct) {
      item.get("status")!.setValue(GlassAnswerStatus.Error);
    } else if (item.get("status")!.value === GlassAnswerStatus.Error) {
      item.get("status")!.setValue(GlassAnswerStatus.Pending);
    } 

    let nextItem = this.foundNextActiveLetter(-1, player);
    nextItem.get("status").setValue(GlassAnswerStatus.Active);
    
    this.recountAnswers(gameIndex);
  }

  onFail(gameIndex:number, itemIndex : number) {
    let player = this.players.at(gameIndex);
    let item = this.getPlayerItems(player).at(itemIndex);
    item.get("status")!.setValue(GlassAnswerStatus.Error);

    let nextItem = this.foundNextActiveLetter(itemIndex, player);
    nextItem.get("status").setValue(GlassAnswerStatus.Active);
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
    c.code = "";
    c.createdDate = new Date;
    c.dictionaryId = dictionaryId;
    c.id = 0;
    c.allLetters = true;
    c.players = [];
    c.includeTesting = false;
    c.letterContains = [];
    c.letterCount = 25;
    c.maxDefinitionLen = 0;
    c.maxWordCount = 0;
    c.pageCount = 1;
    c.playerCount = 1;
    c.playingRules = [];
    c.save = true;
    c.subtitle = "Rosco";
    c.name = "Torneo"
    return c;
    
  }
}
