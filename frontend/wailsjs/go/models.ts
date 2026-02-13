export namespace model {
	
	export class Database {
	    name: string;
	
	    static createFrom(source: any = {}) {
	        return new Database(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	    }
	}
	export class ConnectResult {
	    session_id: string;
	    pool_key: string;
	    database: string;
	    databases: Database[];
	
	    static createFrom(source: any = {}) {
	        return new ConnectResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.session_id = source["session_id"];
	        this.pool_key = source["pool_key"];
	        this.database = source["database"];
	        this.databases = this.convertValues(source["databases"], Database);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	export class SQLResult {
	    columns: string[];
	    rows: any[][];
	    affected_rows: number;
	    last_insert_id: number;
	    execution_time: number;
	    error: string;
	
	    static createFrom(source: any = {}) {
	        return new SQLResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.columns = source["columns"];
	        this.rows = source["rows"];
	        this.affected_rows = source["affected_rows"];
	        this.last_insert_id = source["last_insert_id"];
	        this.execution_time = source["execution_time"];
	        this.error = source["error"];
	    }
	}

}

