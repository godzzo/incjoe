SELECT 
		* 
	FROM actor 
	LIMIT ${pInt(obj.parms.limit, 100)} OFFSET ${pInt(obj.parms.offset, 0)}
