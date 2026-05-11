import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo
} from "sequelize-typescript";
import Whatsapp from "./Whatsapp";

@Table
class WppKey extends Model<WppKey> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Whatsapp)
  @Column
  connectionId: number;

  @Column(DataType.STRING)
  type: string;

  @Column(DataType.STRING)
  keyId: string;

  @Column(DataType.TEXT)
  value: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @BelongsTo(() => Whatsapp)
  whatsapp: Whatsapp;
}

export default WppKey;
