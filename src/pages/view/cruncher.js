import React, { Component } from "react"
import axios from "axios"
import Auth from "../../modules/Auth"
//import Utils from "../../modules/utils"

export class Cruncher extends Component{
	constructor(){
		super()
		this.state={
			messages:[{}],
			streams:[{}],
			parameters:[],
			set:0,
			query:[{},{}],
			result:'',
			queryResult:[],
			method:null,
		}
		this.params={compare:[],value:[],keys:[]}
	}

	componentWillMount(){
		axios.get("/sessions/"+this.props.id+"/messages",Auth.header()).then(
			result=>{
				this.setState({
					messages:result.data
				})
			}
		).catch(err=>{console.log("failed to get messages")})
		axios.get('/sessions/'+this.props.id+'/streams',Auth.header()).then(
			result=>{
				this.setState({
					streams:result.data,
				})
			}
		).catch(err=>{console.log("failed to get streams")})
	}

	addKey=(e)=>{
		e.preventDefault()
		let newQ=Array.from(this.state.query)	
		newQ[this.state.set-1][this.select.value]={}
		this.setState({
			query:newQ,
		})
	}
	
	removeKey=(key)=>{
		let newQ=Array.from(this.state.query)	
		delete newQ[this.state.set-1][key]
		this.setState({
			query:newQ,
		})
	}

	componentDidRecieveProps(){
		this.setState({
			messages:[{}],
			streams:[{}],
			parameters:[],
			set:0,
			query:[{},{}],
			result:'',
			queryResult:[],
			method:null,
		})
	}


	update=(e)=>{
		e.preventDefault()

		let querySet = (this.state.set>1 ? this.state.streams : this.state.messages )
		this.params.keys.forEach( (key,i)=>{
			switch (this.params.compare[i].selectedIndex){
				case 0:
					try{
						querySet=querySet.filter((val,j)=>{
							return  Number(val[key]) < Number(this.params.value[i].value)});
					} catch(err){
						console.log(err)
					}
					break;
				case 1:
					try{
						querySet=querySet.filter((val,j)=>{return Number(val[key]) <= Number(this.params.value[i].value)});
					} catch(err){
						console.log(err)
					}
					break;
				case 2:
					try{
						querySet=querySet.filter((val,j)=>{return String(val[key]) === String(this.params.value[i].value)});
					} catch(err){
						console.log(err)
					}
					break;
				case 3:
					try{
						querySet=querySet.filter((val,j)=>{return (Number(val[key]) >= Number(this.params.value[i].value))});
					} catch(err){
						console.log(err)
					}
					break;
				case 4:
					try{
						querySet=querySet.filter((val,j)=>{return Number(val[key] > this.params.value[i].value)});
					} catch(err){
						console.log(err)
					}
					break;
			}
		})
		this.setState({
			queryResult:querySet,
			result:querySet.length
		})
	}

	valRef=(ref)=>{
		if (ref){
			this.params.value.push(ref)
		}
	}

	comRef=(ref)=>{
		if (ref){
			this.params.compare.push(ref)
		}
	}


	render(){

		//map keys to select optipns
		let mOpt=Object.keys(this.state.messages[0]||[]).map((val,i)=>{
			return <option value={val}> {val} </option>
		})

		let sOpt=Object.keys(this.state.streams[0]||[]).map((val,i)=>{
			return <option value={val}> {val} </option>
		})
		
		//reset ref arrays
		delete this.params.compare
		delete this.params.keys
		delete this.params.value
		this.params={compare:[],value:[],keys:[]}

		//create the forms for filtering data
		let qu
		if (this.state.query[this.state.set-1]){
			qu = Object.keys(this.state.query[this.state.set-1]).map((val,i)=>{
				//let index=i
				this.params.keys.push(val)
				return <form key={i} id={"f-"+val} onSubmit={(e)=>{this.update(e)}}>
							<button type="button" onClick={()=>{this.removeKey(val)}} >X</button>
							<label for={val}>{val}</label>
							<span> Where:  </span>
							<input id={val} ref={(ref)=>{this.valRef(ref)}} type="text"/>
							<select ref={(ref)=>{this.comRef(ref)}}>
								<option value="less" > {'<'} </option>
								<option value="lessEq" >  {'<='} </option>
								<option value="eq" > {'='} </option>
								<option value="more" > {'>='} </option>
								<option value="moreEq" > {'>'} </option>
							</select>
							<button >{'>>'}</button>
						</form>
			})
		}
		
		return(
			<div className="ui cruncher">
				<div>
					<label>Feature in Development...</label>
				</div>
				<button onClick={()=>{this.setState({set:1})}}> Messages </button>
				<button onClick={()=>{this.setState({set:2})}}> Streams </button>
				<form onSubmit={(e)=>{this.addKey(e)}} >
					<select name="key" ref={(ref)=>this.select=ref}>
						{["",mOpt,sOpt][this.state.set]}
					</select>
					<button> >> </button>
				</form>
				{this.state.set && <div className="queryer">
					{qu || ""}
				<label> Remaining Items: {this.state.result} </label>
				<button onClick={()=>{this.setState({method:1})}} > Plot </button> <button onClick={()=>{this.setState({method:2})}} > Reduce </button>
				{["",<Plotter plot={this.props.plot} data={this.state.queryResult} />, <Reducer className="evalBox" plot={this.props.plot} data={this.state.queryResult} />][this.state.method]}
				</div>}
			</div>
		)
	}
}


//TODO make plotting work
export class Plotter extends Component{
	render(){
		let keys=Object.keys(this.props.data[0]).map((val,i)=>{
			return <option key={i} value={val} >{val}</option> 
		})
		return(
		<form className="evalBox" onSubmit={(e)=>{this.props.plot()}}>
			<h5>Plot</h5>
			<label for="x">x-axis:</label>
			<select id="x">
				{keys}
			</select>
			<label for="y">y-axis:</label>
			<select id="y">
				{keys}
			</select>
			<input type="submit" />
		</form>
		)
	}
}

//TODO make reducers work
export class Reducer extends Component{
	constructor(){
		super();
		this.state={
			result:0
		}
	}
	minimum(data){
		let result = data.reduce((a,b)=>{
			return (a[this.key.value]<b[this.key.value] ? a : b )
		})
		return result[this.key.value]
	}

	maximum(data){
		let result = data.reduce((a,b)=>{
			return (a[this.key.value]>b[this.key.value] ? a : b )
		})
		return result[this.key.value]
	}

	mean(data){
		let result=data.reduce((a,b)=>{
			return a[this.key.value]+b[this.key.value]
		})
		return result
	}

	mode(data){
		let result=data.reduce((a,b)=>{
			if (!a){
				return {vals:[],freq:[]}
			} else {
				let index = a.vals.indexOf(b[this.key.value])
				let newA=a
				if (index>=0){
					newA.freq[index]+=1
					return newA
				} else {
					newA.vals.push(b[this.key.value])
					newA.freq.push(0)
					return newA
				}
			}
		},null)
		return result
	}

	median(data){
		let mid=(data.length%2 ? [(data.length)/2,(data.length)/2+1] : [(data.length+1)/2] )
		let val=0;
		mid.forEach((val)=>{
			val+=data[this.key.value][val]
		})
		return val/mid.length
	}

	stDev(data){
		let mean = this.mean(data)
		let result = data.reduce((a,b)=>{
			return a+Math.pow(b-mean,2)
		})
		result = result/(data.length-1)
		return result
	}

	length(data){
		return data.length
	}

	switcher(index,e){
		e.preventDefault()
		switch (index){
			case 0:
				this.update(this.minimum);
				break;
			case 1:
				this.update(this.maximum);
				break;
			case 2:
				this.update(this.mean);
				break;
			case 3:
				this.update(this.mode);
				break;
			case 4:
				this.update(this.median);
				break;
			case 5:
				this.update(this.stDev);
				break;
			case 6:
				this.update(this.length);
				break;
		}
	}

	update(func){
		let value = func(this.props.data)
		this.setState({
			result:value
		})
	}

	render(){
		let keys=Object.keys(this.props.data[0]).map((val,i)=>{
			return <option key={i} value={val} >{val}</option> 
		})
		return(
		<div className="evalBox" >
			<form onSubmit={(e)=>this.switcher(this.reduce.selectedIndex,e.nativeEvent)}>
				<h5>Reduce</h5>
				<label for="data">Data: </label>
				<select id="data" ref={(ref)=>{this.key=ref}}>
					{keys}
				</select>
				<label for="reduction">Reduction</label>
				<select id="reduction" ref={(ref)=>{this.reduce=ref}} >
					<option value="Mimumum"> Minimum </option>
					<option value="Maximum"> Maximum </option>
					<option value="Mean"> Mean </option>
					<option value="Mode"> Mode </option>
					<option value="Median"> Median </option>
					<option value="Standard Deviation"> Standard Deviation </option>
					<option value="Length"> Standard Deviation </option>
				</select>
				<input type="submit" />
			</form>
			<span> {this.state.result} </span>
		</div>
		)
	}
}

export default Cruncher
