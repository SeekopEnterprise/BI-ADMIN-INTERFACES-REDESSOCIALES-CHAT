export interface RedesUsuarios {
    idredusuario:number,
    idred:String,
    iddistribuidor:String,
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

