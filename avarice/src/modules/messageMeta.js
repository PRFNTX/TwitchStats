const axios=require('axios')
let MessageMeta={};
	MessageMeta.session={	type:['secondary','query'],		query:["Message","Stream"], access:"simple"};
	MessageMeta.reader={	type:['secondary','query'], 	query:['Message','Stream'], access:"simple"};
	MessageMeta.time={		type:['query','point'], 		query:['Message','Stream'], access:"simple"};
	//this.emotes={type:['primary'], query:null, access:"none"};
	MessageMeta.id={		type:['primary'], 				query:null,	 				access:"none"};
	MessageMeta.mod={		type:['query'], 				query:['Message'], 			access:"simple"};
	MessageMeta.subscriber={type:['query','point'], 		query:['Message'], 			access:"simple"};
	MessageMeta.turbo={		type:['query','point'], 		query:['Message'], 			access:"simple"};
	MessageMeta.user_id={	type:['query'], 				query:['Message'], 			access:"simple"};
	MessageMeta.badges={
		broadcaster:{		type:['query','point'],			query:['Message'],			access:"simple"},
		subscriber:{		type:['query','point'],			query:['Message'],			access:"simple"}
	}
	//MessageMeta.message={	type:[''], 				query:null, 				access:"simple"};
	MessageMeta.username={	type:['username'], 				query:null, 				access:"simple"};

	MessageMeta.endpoint="/view/messages"
	MessageMeta.toData=(data,by='length')=>{
		switch(by){
			case "length":
				return data.length;
		}
	}
	MessageMeta.query= async (key="")=>{
		return await axios.get("this.endpoint"+key)
	}

export default MessageMeta
