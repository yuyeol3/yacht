import { useNavigate } from "react-router-dom"
import { gameController } from "./GameController";
import { Player } from "./Player";
import { useState } from "react";
import "./GameUI.css";

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
        <div className="start-screen app-container">
            <div className="entry-card">
                <div className="entry-head">
                    <h1>Yacht</h1>
                    <p>플레이어를 추가한 뒤 시작하세요</p>
                </div>
                <div className="player-input">
                    <input
                        className="text-input"
                        placeholder="플레이어 이름"
                        value={name}
                        onChange={e=>setName(e.target.value)}
                        onKeyDown={(e)=>{ if (e.key === 'Enter') addPlayer(); }}
                    />
                    <button className="secondary-button" onClick={addPlayer}>추가</button>
                </div>
                <div className="player-list">
                    {playerNames.map((val, idx)=>{
                        const initial = (val?.[0] || 'P').toUpperCase();
                        return (
                            <div className="player-chip" key={val + idx}>
                                <span className="avatar">{initial}</span>
                                <span>{val}</span>
                                <button className="remove" title="제거" onClick={()=>removePlayer(val)}>×</button>
                            </div>
                        )
                    })}
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <button className="primary-button" disabled={playerNames.length < 2} onClick={startGame}>시작하기</button>
                </div>
            </div>
        </div>
    )
}
