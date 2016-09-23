const Pool = require('pg').Pool
const _ = require('underscore')
const config = this.Meteor ? Meteor.settings : require('../../config')
const _knex = require('knex')
if (!this.Meteor) {
  global.LivePg = require('pg-live-select')
}
const knex = _knex({
  client: 'pg'
})

const errors = Object.freeze({
  CASE_NOT_FOUND: '20000',
  CARDINALITY_VIOLATION: '21000',
  DATA_EXCEPTION: '22000',
  STRING_DATA_RIGHT_TRUNCATION: '01004',
  NULL_VALUE_NO_INDICATOR_PARAMETER: '22002',
  NUMERIC_VALUE_OUT_OF_RANGE: '22003',
  NULL_VALUE_NOT_ALLOWED: '39004',
  ERROR_IN_ASSIGNMENT: '22005',
  INVALID_DATETIME_FORMAT: '22007',
  DATETIME_FIELD_OVERFLOW: '22008',
  INVALID_TIME_ZONE_DISPLACEMENT_VALUE: '22009',
  INVALID_INDICATOR_PARAMETER_VALUE: '22010',
  SUBSTRING_ERROR: '22011',
  DIVISION_BY_ZERO: '22012',
  INVALID_ARGUMENT_FOR_NTILE_FUNCTION: '22014',
  INTERVAL_FIELD_OVERFLOW: '22015',
  INVALID_ARGUMENT_FOR_NTH_VALUE_FUNCTION: '22016',
  INVALID_CHARACTER_VALUE_FOR_CAST: '22018',
  INVALID_ESCAPE_CHARACTER: '22019',
  CHARACTER_NOT_IN_REPERTOIRE: '22021',
  INDICATOR_OVERFLOW: '22022',
  INVALID_PARAMETER_VALUE: '22023',
  UNTERMINATED_C_STRING: '22024',
  INVALID_ESCAPE_SEQUENCE: '22025',
  STRING_DATA_LENGTH_MISMATCH: '22026',
  TRIM_ERROR: '22027',
  INTEGRITY_CONSTRAINT_VIOLATION: '23000',
  RESTRICT_VIOLATION: '23001',
  NOT_NULL_VIOLATION: '23502',
  FOREIGN_KEY_VIOLATION: '23503',
  UNIQUE_VIOLATION: '23505',
  CHECK_VIOLATION: '23514',
  INVALID_CURSOR_STATE: '24000',
  INVALID_TRANSACTION_STATE: '25000',
  ACTIVE_SQL_TRANSACTION: '25001',
  BRANCH_TRANSACTION_ALREADY_ACTIVE: '25002',
  INAPPROPRIATE_ACCESS_MODE_FOR_BRANCH_TRANSACTION: '25003',
  INAPPROPRIATE_ISOLATION_LEVEL_FOR_BRANCH_TRANSACTION: '25004',
  NO_ACTIVE_SQL_TRANSACTION_FOR_BRANCH_TRANSACTION: '25005',
  READ_ONLY_SQL_TRANSACTION: '25006',
  SCHEMA_AND_DATA_STATEMENT_MIXING_NOT_SUPPORTED: '25007',
  HELD_CURSOR_REQUIRES_SAME_ISOLATION_LEVEL: '25008',
  INVALID_SQL_STATEMENT_NAME: '26000',
  TRIGGERED_DATA_CHANGE_VIOLATION: '27000',
  INVALID_AUTHORIZATION_SPECIFICATION: '28000',
  INVALID_CURSOR_NAME: '34000',
  EXTERNAL_ROUTINE_EXCEPTION: '38000',
  CONTAINING_SQL_NOT_PERMITTED: '38001',
  MODIFYING_SQL_DATA_NOT_PERMITTED: '2F002',
  PROHIBITED_SQL_STATEMENT_ATTEMPTED: '2F003',
  READING_SQL_DATA_NOT_PERMITTED: '2F004',
  EXTERNAL_ROUTINE_INVOCATION_EXCEPTION: '39000',
  INVALID_SQLSTATE_RETURNED: '39001',
  TRANSACTION_ROLLBACK: '40000',
  SERIALIZATION_FAILURE: '40001',
  TRANSACTION_INTEGRITY_CONSTRAINT_VIOLATION: '40002',
  STATEMENT_COMPLETION_UNKNOWN: '40003',
  SYNTAX_ERROR_OR_ACCESS_RULE_VIOLATION: '42000',
  INSUFFICIENT_PRIVILEGE: '42501',
  SYNTAX_ERROR: '42601',
  INVALID_NAME: '42602',
  INVALID_COLUMN_DEFINITION: '42611',
  NAME_TOO_LONG: '42622',
  DUPLICATE_COLUMN: '42701',
  AMBIGUOUS_COLUMN: '42702',
  UNDEFINED_COLUMN: '42703',
  UNDEFINED_OBJECT: '42704',
  DUPLICATE_OBJECT: '42710',
  DUPLICATE_ALIAS: '42712',
  DUPLICATE_FUNCTION: '42723',
  AMBIGUOUS_FUNCTION: '42725',
  GROUPING_ERROR: '42803',
  DATATYPE_MISMATCH: '42804',
  WRONG_OBJECT_TYPE: '42809',
  INVALID_FOREIGN_KEY: '42830',
  CANNOT_COERCE: '42846',
  UNDEFINED_FUNCTION: '42883',
  RESERVED_NAME: '42939',
  WITH_CHECK_OPTION_VIOLATION: '44000',
  INSUFFICIENT_RESOURCES: '53000',
  DISK_FULL: '53100',
  OUT_OF_MEMORY: '53200',
  TOO_MANY_CONNECTIONS: '53300',
  CONFIGURATION_LIMIT_EXCEEDED: '53400',
  PROGRAM_LIMIT_EXCEEDED: '54000',
  STATEMENT_TOO_COMPLEX: '54001',
  TOO_MANY_COLUMNS: '54011',
  TOO_MANY_ARGUMENTS: '54023',
  OBJECT_NOT_IN_PREREQUISITE_STATE: '55000',
  OBJECT_IN_USE: '55006',
  OPERATOR_INTERVENTION: '57000',
  QUERY_CANCELED: '57014',
  SYSTEM_ERROR: '58000',
  IO_ERROR: '58030',
  SUCCESSFUL_COMPLETION: '00000',
  WARNING: '01000',
  DYNAMIC_RESULT_SETS_RETURNED: '0100C',
  IMPLICIT_ZERO_BIT_PADDING: '01008',
  NULL_VALUE_ELIMINATED_IN_SET_FUNCTION: '01003',
  PRIVILEGE_NOT_GRANTED: '01007',
  PRIVILEGE_NOT_REVOKED: '01006',
  DEPRECATED_FEATURE: '01P01',
  NO_DATA: '02000',
  NO_ADDITIONAL_DYNAMIC_RESULT_SETS_RETURNED: '02001',
  SQL_STATEMENT_NOT_YET_COMPLETE: '03000',
  CONNECTION_EXCEPTION: '08000',
  CONNECTION_DOES_NOT_EXIST: '08003',
  CONNECTION_FAILURE: '08006',
  SQLCLIENT_UNABLE_TO_ESTABLISH_SQLCONNECTION: '08001',
  SQLSERVER_REJECTED_ESTABLISHMENT_OF_SQLCONNECTION: '08004',
  TRANSACTION_RESOLUTION_UNKNOWN: '08007',
  PROTOCOL_VIOLATION: '08P01',
  TRIGGERED_ACTION_EXCEPTION: '09000',
  FEATURE_NOT_SUPPORTED: '0A000',
  INVALID_TRANSACTION_INITIATION: '0B000',
  LOCATOR_EXCEPTION: '0F000',
  INVALID_LOCATOR_SPECIFICATION: '0F001',
  INVALID_GRANTOR: '0L000',
  INVALID_GRANT_OPERATION: '0LP01',
  INVALID_ROLE_SPECIFICATION: '0P000',
  DIAGNOSTICS_EXCEPTION: '0Z000',
  STACKED_DIAGNOSTICS_ACCESSED_WITHOUT_ACTIVE_HANDLER: '0Z002',
  ARRAY_SUBSCRIPT_ERROR: '2202E',
  ESCAPE_CHARACTER_CONFLICT: '2200B',
  INVALID_ARGUMENT_FOR_LOGARITHM: '2201E',
  INVALID_ARGUMENT_FOR_POWER_FUNCTION: '2201F',
  INVALID_ARGUMENT_FOR_WIDTH_BUCKET_FUNCTION: '2201G',
  INVALID_ESCAPE_OCTET: '2200D',
  NONSTANDARD_USE_OF_ESCAPE_CHARACTER: '22P06',
  INVALID_REGULAR_EXPRESSION: '2201B',
  INVALID_ROW_COUNT_IN_LIMIT_CLAUSE: '2201W',
  INVALID_ROW_COUNT_IN_RESULT_OFFSET_CLAUSE: '2201X',
  INVALID_USE_OF_ESCAPE_CHARACTER: '2200C',
  MOST_SPECIFIC_TYPE_MISMATCH: '2200G',
  ZERO_LENGTH_CHARACTER_STRING: '2200F',
  FLOATING_POINT_EXCEPTION: '22P01',
  INVALID_TEXT_REPRESENTATION: '22P02',
  INVALID_BINARY_REPRESENTATION: '22P03',
  BAD_COPY_FILE_FORMAT: '22P04',
  UNTRANSLATABLE_CHARACTER: '22P05',
  NOT_AN_XML_DOCUMENT: '2200L',
  INVALID_XML_DOCUMENT: '2200M',
  INVALID_XML_CONTENT: '2200N',
  INVALID_XML_COMMENT: '2200S',
  INVALID_XML_PROCESSING_INSTRUCTION: '2200T',
  EXCLUSION_VIOLATION: '23P01',
  NO_ACTIVE_SQL_TRANSACTION: '25P01',
  IN_FAILED_SQL_TRANSACTION: '25P02',
  INVALID_PASSWORD: '28P01',
  DEPENDENT_PRIVILEGE_DESCRIPTORS_STILL_EXIST: '2B000',
  DEPENDENT_OBJECTS_STILL_EXIST: '2BP01',
  INVALID_TRANSACTION_TERMINATION: '2D000',
  SQL_ROUTINE_EXCEPTION: '2F000',
  FUNCTION_EXECUTED_NO_RETURN_STATEMENT: '2F005',
  TRIGGER_PROTOCOL_VIOLATED: '39P01',
  SRF_PROTOCOL_VIOLATED: '39P02',
  SAVEPOINT_EXCEPTION: '3B000',
  INVALID_SAVEPOINT_SPECIFICATION: '3B001',
  INVALID_CATALOG_NAME: '3D000',
  INVALID_SCHEMA_NAME: '3F000',
  DEADLOCK_DETECTED: '40P01',
  WINDOWING_ERROR: '42P20',
  INVALID_RECURSION: '42P19',
  INDETERMINATE_DATATYPE: '42P18',
  COLLATION_MISMATCH: '42P21',
  INDETERMINATE_COLLATION: '42P22',
  UNDEFINED_TABLE: '42P01',
  UNDEFINED_PARAMETER: '42P02',
  DUPLICATE_CURSOR: '42P03',
  DUPLICATE_DATABASE: '42P04',
  DUPLICATE_PREPARED_STATEMENT: '42P05',
  DUPLICATE_SCHEMA: '42P06',
  DUPLICATE_TABLE: '42P07',
  AMBIGUOUS_PARAMETER: '42P08',
  AMBIGUOUS_ALIAS: '42P09',
  INVALID_COLUMN_REFERENCE: '42P10',
  INVALID_CURSOR_DEFINITION: '42P11',
  INVALID_DATABASE_DEFINITION: '42P12',
  INVALID_FUNCTION_DEFINITION: '42P13',
  INVALID_PREPARED_STATEMENT_DEFINITION: '42P14',
  INVALID_SCHEMA_DEFINITION: '42P15',
  INVALID_TABLE_DEFINITION: '42P16',
  INVALID_OBJECT_DEFINITION: '42P17',
  CANT_CHANGE_RUNTIME_PARAM: '55P02',
  LOCK_NOT_AVAILABLE: '55P03',
  ADMIN_SHUTDOWN: '57P01',
  CRASH_SHUTDOWN: '57P02',
  CANNOT_CONNECT_NOW: '57P03',
  DATABASE_DROPPED: '57P04',
  UNDEFINED_FILE: '58P01',
  DUPLICATE_FILE: '58P02',
  CONFIG_FILE_ERROR: 'F0000',
  LOCK_FILE_EXISTS: 'F0001',
  FDW_ERROR: 'HV000',
  FDW_COLUMN_NAME_NOT_FOUND: 'HV005',
  FDW_DYNAMIC_PARAMETER_VALUE_NEEDED: 'HV002',
  FDW_FUNCTION_SEQUENCE_ERROR: 'HV010',
  FDW_INCONSISTENT_DESCRIPTOR_INFORMATION: 'HV021',
  FDW_INVALID_ATTRIBUTE_VALUE: 'HV024',
  FDW_INVALID_COLUMN_NAME: 'HV007',
  FDW_INVALID_COLUMN_NUMBER: 'HV008',
  FDW_INVALID_DATA_TYPE: 'HV004',
  FDW_INVALID_DATA_TYPE_DESCRIPTORS: 'HV006',
  FDW_INVALID_DESCRIPTOR_FIELD_IDENTIFIER: 'HV091',
  FDW_INVALID_HANDLE: 'HV00B',
  FDW_INVALID_OPTION_INDEX: 'HV00C',
  FDW_INVALID_OPTION_NAME: 'HV00D',
  FDW_INVALID_STRING_LENGTH_OR_BUFFER_LENGTH: 'HV090',
  FDW_INVALID_STRING_FORMAT: 'HV00A',
  FDW_INVALID_USE_OF_NULL_POINTER: 'HV009',
  FDW_TOO_MANY_HANDLES: 'HV014',
  FDW_OUT_OF_MEMORY: 'HV001',
  FDW_NO_SCHEMAS: 'HV00P',
  FDW_OPTION_NAME_NOT_FOUND: 'HV00J',
  FDW_REPLY_HANDLE: 'HV00K',
  FDW_SCHEMA_NOT_FOUND: 'HV00Q',
  FDW_TABLE_NOT_FOUND: 'HV00R',
  FDW_UNABLE_TO_CREATE_EXECUTION: 'HV00L',
  FDW_UNABLE_TO_CREATE_REPLY: 'HV00M',
  FDW_UNABLE_TO_ESTABLISH_CONNECTION: 'HV00N',
  PLPGSQL_ERROR: 'P0000',
  RAISE_EXCEPTION: 'P0001',
  NO_DATA_FOUND: 'P0002',
  TOO_MANY_ROWS: 'P0003',
  INTERNAL_ERROR: 'XX000',
  DATA_CORRUPTED: 'XX001',
  INDEX_CORRUPTED: 'XX002'
})

const pool = new Pool({
  database: 'evart',
  user: 'evart',
  password: 'evart'
})

_knex.Client.prototype.QueryBuilder.prototype._toSQL
  = _knex.Client.prototype.QueryBuilder.prototype.toSQL

_knex.Client.prototype.QueryBuilder.prototype.toSQL = function () {
  const q = this._toSQL()
  let i = 0
  let raw = q.sql
  q.sql = q.sql.replace(/\?/g, () => '$' + ++i)
  let j = 0
  if (q.bindings instanceof Array && q.bindings.length > 0) {
    raw = raw.replace(/\?/g, function () {
      const value = q.bindings[j++]
      return 'string' === typeof value ? `'${value}'` : value
    })
  }
  if (raw.indexOf('"log"') < 0) {
    console.log(raw)
  }
  return q
}

const liveDb = new LivePg('postgres://evart:evart@127.0.0.1/evart', 'channel')

function liveSQL(rawSQL, bindings) {
  return liveDb.select(rawSQL, bindings)
}

_.extend(_knex.Client.prototype.QueryBuilder.prototype, {
  cursor: function () {
    const q = this.toSQL()
    return q.bindings instanceof Array && q.bindings.length > 0
      ? liveSQL(q.sql, q.bindings)
      : liveSQL(q.sql)
  },

  promise: function () {
    return new Promise((resolve, reject) => {
      pool.connect((err, client, done) => {
        if (err) {
          reject(err)
          done()
        }
        else {
          const q = this.toSQL()
          client.query(q.sql, q.bindings, function (err, result) {
            if (err) {
              reject(err)
            }
            else {
              resolve(result)
            }
            done()
          })
        }
      })
    })
  },

  single: function () {
    return this.promise().then(result => result.rows[0])
  },

  many: function () {
    return this.promise().then(result => result)
  },

  search: function (string) {
    if ('string' === typeof string) {
      string.trim().split(/\s+/).forEach(token => {
        if (token) {
          this.where('name', 'ilike', `%${token}%`)
        }
      })
    }
    return this
  }
})

function sql(sql, bindings) {
  return new Promise((resolve, reject) => {
    pool.connect((err, client, done) => {
      if (err) {
        reject(err)
        done()
      }
      else {
        client.query(sql, bindings, function (err, result) {
          if (err) {
            reject(err)
          }
          else {
            resolve(result)
          }
          done()
        })
      }
    })
  })
}

function retrySQL(sql, bindings, codes) {
  return new Promise((resolve, reject) => {
    pool.connect((err, client, done) => {
      if (err) {
        reject(err)
        done()
      }
      else {
        client.query(sql, bindings, function (err, result) {
          if (err) {
            if (codes.indexOf(err.code) >= 0) {
              setTimeout(function () {
                retrySQL(sql, bindings, codes).then(resolve, reject)
              }, _.random(0, config.postgresql.retry))
            }
            else {
              reject(err)
            }
          }
          else {
            resolve(result)
          }
          done()
        })
      }
    })
  })
}

function query(table, params = {}) {
  const q = knex.table(table)
  q.where(_.pick(params, 'id', 'recipient', 'peer', 'parent', 'type', 'owner', 'from', 'to', 'relation'))
  if (params.random) {
    q.orderBy(knex.raw('random()'))
  }
  else if (params.order) {
    _.each(params.order, function (direction, name) {
      q.orderBy(name, direction > 0 ? 'asc' : 'desc')
    })
  }
  q.search(params.search)
  if (params.limit) {
    q.limit(params.limit)
  }
  return q
}

const start = Date.now() / 1000 - process.hrtime()[0]

function timeId() {
  let now = process.hrtime()
  now[1] -= Math.round(Math.random() * 50 * 1000 * 1000)
  return ((start + now[0]) * 1000 * 1000 * 1000 + now[1]).toString()
}

function log(type, action, params) {
  const record = {
    type,
    action,
    id: timeId(),
    ip: Meteor.call('ip')
  }
  if (Meteor.userId()) {
    record.actor = Meteor.userId()
  }
  if (!_.isEmpty(params)) {
    record.data = params
  }
  return knex.table('log').insert(record).promise()
}

module.exports = {
  knex,
  table: name => knex.table(name),
  sql,
  query,
  liveSQL,
  timeId,
  errors,
  retrySQL,
  log
}