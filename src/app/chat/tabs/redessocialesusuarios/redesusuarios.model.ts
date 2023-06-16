export interface RedesUsuarios {
    idredusuario:number,
    idred:number,
    idusuario:String,
    idcliente:String,
    identificadorplataforma:String,
    nombrepagina:String,
    token: String,
    fechacreacion: Date,
    fechavencimimiento: Date
}

export interface UsuariosAWS {
    idusuario: number,
    user:	String,
    clave:	String,
    nombre:	String,
    email:	String
}

/*
idredusuario	int(11)
idred	int(11)
idusuario	varchar(20)
idcliente	varchar(100)
identificadorplataforma	varchar(100)
nombrepagina	varchar(100)
token	varchar(100)
fechacreacion	date
fechavencimimiento	date
*/