import React, {useState} from "react"
import axios from "axios"

export default function App(){
  const [id, setId] = useState("")
  const [skills, setSkills] = useState("")
  const [result, setResult] = useState(null)

  async function submit(e){
    e.preventDefault()
    const payload = { id, skills: skills.split(",").map(s => s.trim()).filter(Boolean) }
    const res = await axios.post("http://localhost:8000/api/match", payload)
    setResult(res.data)
  }

  return (
    <div style={{padding:20,fontFamily:'sans-serif'}}>
      <h1>Skill Exchange — Demo</h1>
      <form onSubmit={submit}>
        <div>
          <label>User ID</label><br/>
          <input value={id} onChange={e=>setId(e.target.value)} />
        </div>
        <div>
          <label>Skills (comma separated)</label><br/>
          <input value={skills} onChange={e=>setSkills(e.target.value)} style={{width:'60%'}} />
        </div>
        <button type="submit">Find Matches</button>
      </form>
      {result && (
        <div style={{marginTop:20}}>
          <h3>Matches</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}
