import { useNavigate } from "react-router-dom"
import { gameController } from "./GameController";
import { Player } from "./Player";
import { useState } from "react";

export default function GameEntryPoint() {
    const [playerNames, setPlayerNames] = useState([]);
    const [name, setName] = useState("");

    const navigate = useNavigate();
    const startGame = ()=>{
        if (playerNames.length < 2) return;

        gameController.initialize(
            [...playerNames.map((val, idx)=>new Player(idx, val))]
        )
        
        navigate("/game");
    }

    const addPlayer = ()=>{

        setPlayerNames([
            ...playerNames, 
            name==="" ? "Player" + (playerNames.length + 1) : name]
        )
        setName("");
    }

    const removePlayer = (name)=> {
        setPlayerNames([...playerNames.filter((e)=>e!==name)]);
    }

    return (
        <div className="game-content">
            <div>
                <input 
                    value={name}
                    onChange={e=>setName(e.target.value)}/>
                <button onClick={addPlayer}>추가</button>
                <div>
                {playerNames.map((val, idx)=>{
                    return (<div key={val + idx}>
                        {val}
                        <button onClick={()=>removePlayer(val)}>제거</button>
                    </div>)
                })}
            </div>
            <button onClick={startGame}>시작하기</button>
            </div>

        </div>
    )
}