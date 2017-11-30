var StreamMeta={};

StreamMeta.session={		type:['secondary','query'],	query:["Session","Message","Stream"],	access:"simple"}
StreamMeta.reader={			type:['secondary','query'],	query:["Session","Message","Stream"],	access:"simple"}
StreamMeta.id={				type:['secondary'], 		query:null, 							access:"none"};
StreamMeta.game={			type:['query, data'],		query:["Stream"],						access:"simple"};
StreamMeta.viewers={		type:['data'], 				query:null, 							access:"simple"};
StreamMeta.average_fps={	type:['data'],				query:null,								access:"simple"};
StreamMeta.created_at={		type:['query'],				query:['Stream','Message'],				access:"simple"};
StreamMeta.is_playlist={	type:['query'],				query:['Stream'],						access:"simple"};

StreamMeta.toData=(data,by='length')=>{
	switch(by){
		case 'length':
			return data.length;
	}
}
	
export default StreamMeta
