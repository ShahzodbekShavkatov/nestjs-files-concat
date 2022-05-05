function getRange(len){
	if(isNaN(len)){
		throw Error('input should be number');
	}
	if(Number(len) > 18277){
		throw Error('maximum length supported is 18277');
	}
	var map = [
		"","A","B","C","D","E","F","G","H","I","J",
		"K","L","M","N","O","P","Q","R","S","T","U",
		"V","W","X","Y","Z"
	];
	var val = [0, 0, 0];	
	while(len){
		if(len > 26){
			len = len - 26; 
			if(val[1] < 26){
				val[1] = (val[1] + 1);
			}else{
				val[0] = (val[0] + 1); 
				val[1] = 1;
			}
		}else{
			var remain = (26 - val[2]);
			if(len >= remain){
				len = (len - remain);
				if(val[1] >= 26){
					val[0] = val[0] + 1;
					val[1] = 1;
					val[2] = (1 + len);
				}else{
					if(len > 0){
						val[1] = val[1] + 1;
						val[2] = (1 + len);	
					}else{
						val[2] = val[2] + remain;
					}	
					
				}
				len = 0;
			}else{
				val[2] = (val[2] + len);
				if(val[2] > 26){					
					if(val[1] >= 26){
						val[1] = 1;
						val[0] = (val[0] + 1);
					}else{
						val[1] = (val[1] + 1);
					}
					val[2] = 1;
				}
				len = 0;
			}			
		}	
	}
	return [
		map[val[0]],
		map[val[1]],
		map[val[2]]
	].join('');
}

module.exports = getRange;
