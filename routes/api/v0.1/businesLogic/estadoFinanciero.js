'use strict';
const estadoFinancieroSchema = require("../../../../database/collection/models/estadoFinanciero");
const UtilsEstadoFinancier = require('./utilsEstadFinanciero/utilsEstadoFinanciero');
const ventaSchema = require('../../../../database/collection/models/venta');
const utilsEstadoFinanciero = require('./utilsEstadFinanciero/utilsEstadoFinanciero');
const gastoUsuarioSchema = require('../../../../database/collection/models/gastosUser')
const { user } = require('../../../../database/collection/models/user');
const { negocio } = require('../../../../database/collection/models/negocio');
const { tipoGastos } = require('../../../../database/collection/models/tipoGasto')
const { cliente } = require('../../../../database/collection/models/clientes');
const { pvendido } = require('../../../../database/collection/models/venta');
const { redondearPrecio } = require('../../../../Utils/RedondeNumeros/redondeoPrecios')

class EstadoFinanciero {

    static async createEstadoFinanciero(req, res, next) {
        var idNegocio = req.body.idNegocio;

        var dataStadoFinanciero = await UtilsEstadoFinancier.buscarEstadoFinancieroVigente(idNegocio);

        console.log("createEstadoFinanciero");
        res.status(200).send({ status: "ok", message: "show estado financiero", result: dataStadoFinanciero });
    }



    // actualiza el estado financiero un negocio
    static async updateEstadoFinanciero(idNegocio, idVenta, intPrecioTotal, StringTipoDeOperacion) {

        switch (StringTipoDeOperacion) {
            case "venta": {
                var dataVenta = await ventaSchema.Venta.findById({ _id: idVenta });


                await utilsEstadoFinanciero.buscarEstadoFinancieroVigente(idNegocio);

                var dataEstadoFinanciero = await estadoFinancieroSchema.estadoFinanciero.findOne({ idNegocio: idNegocio, state: true });

                var auxSuma = await dataEstadoFinanciero.montoActualDisponble + dataVenta.precioTotalBackend;
                var sumaRedondeada = await redondearPrecio(auxSuma);
                var listVentas = await [...dataEstadoFinanciero.listVentas, dataVenta._id];
                await estadoFinancieroSchema.estadoFinanciero.findByIdAndUpdate({ _id: dataEstadoFinanciero._id }, { montoActualDisponble: sumaRedondeada, listVentas });
                break;
            }
            case "gasto": {

            }
            default: {
                console.log("tipo de operacion no valida")
            }
        }
    }


    static async updateEstadoFinancieroGasto(idNegocio, idGastoUser, StringTipoDeOperacion) {

        switch (StringTipoDeOperacion) {
            case "gasto": {
                var dataGasto = await gastoUsuarioSchema.gastosUser.findById({ _id: idGastoUser });
                var dataEstadoFinanciero = await estadoFinancieroSchema.estadoFinanciero.findOne({ idNegocio: idNegocio, state: true });

                if (dataEstadoFinanciero.montoActualDisponble >= dataGasto.montoGasto) {

                    var auxSuma = await dataEstadoFinanciero.montoActualUtilizado + dataGasto.montoGasto;
                    var auxSaldofoActual = await dataEstadoFinanciero.montoActualDisponble - dataGasto.montoGasto;
                    var listGastos = await [...dataEstadoFinanciero.listGastos, dataGasto._id];
                    await estadoFinancieroSchema.estadoFinanciero.findByIdAndUpdate({ _id: dataEstadoFinanciero._id }, { montoActualDisponble: auxSaldofoActual, montoActualUtilizado: auxSuma, listGastos });
                }
                if (dataEstadoFinanciero.montoActualDisponble < dataGasto.montoGasto) {
                    console.log(`tipos de transacion no validos, in updateEstadoFinancieroGasto()`,);
                }

                console.log(auxSaldofoActual, dataEstadoFinanciero.montoActualDisponble, dataGasto.montoGasto);
                break;
            }

            default: {
                console.log("tipo de operacion no valida, in updateEstadoFinancieroGasto()");
            }
        }
    }


    static async getEstateFinanciero(idNegocio) {
        try {
            var estadoFinanciero = await estadoFinancieroSchema.estadoFinanciero.findOne({ idNegocio: idNegocio, state: true });
            if (estadoFinanciero) {
                // var dataSaldoAdual = await dataEstadoFinancier.montoActualDisponble - dataEstadoFinancier.montoActualUtilizado;
                return estadoFinanciero;
            }
            if (!estadoFinanciero) {
                return { status: "No fount", message: "no se encontro el estado financiero" }
            }
        }
        catch (error) {
            return { status: "No fount", message: "no se encontro el estado financiero" }
        }

    }

    static async getListVentas(req, res) {

        const { idNegocio } = req.params;

        const dataLisVentas = await utilsEstadoFinanciero.getVentas(idNegocio)
        if (dataLisVentas.status == 'No fount') return res.status(404).send({ status: "error", message: "no se encontro la lista de ventas", datosRequerido: [{ nameParams: "idNegocio", type: "objeciD" }] });

        res.status(200).send({ status: "ok", message: "show list ventas", result: dataLisVentas.listVentas });
    }


    static async getListGastos(req, res) {
        var { idNegocio } = req.params;

        const dataListGastos = await utilsEstadoFinanciero.getGastos(idNegocio)
        if (dataListGastos.status == 'No fount') return res.status(404).send({ status: "error", message: "no se encontro la lista de los gastos", datosRequerido: [{ nameParams: "idNegocio", type: "objeciD" }] });

        res.status(200).send({ status: "ok", message: "show list gastos", result: dataListGastos.listGastos });
    }

    static async cierreCaja(req, res) {
        const { idNegocio, idUser } = req.params;
        const { conformiadCajero, detalle, conformidadAdministrador, idCajero } = req.body;

        const verifyDatas = await validateDatas(conformiadCajero, detalle, conformidadAdministrador, idCajero);
        if (verifyDatas.status == 'No fount') return res.status(206).json(verifyDatas);

        const verifyEstadoFinanciero = await validateEstadoFinanciero(idNegocio);
        /* console.log(verifyEstadoFinanciero, ' =================================================') */
        if (verifyEstadoFinanciero.status == 'No fount') return res.status(206).json(verifyEstadoFinanciero);

        const isAdmin = await validateUserIsAdmin(idUser);
        if (isAdmin.status == 'No fount') return res.status(206).json(isAdmin)
        const verifyNegocio = await validateNegocio(idNegocio);
        if (verifyNegocio.status == 'No fount') return res.status(206).json(verifyNegocio)
        const isCaja = await validateUserIsCajero(idCajero);
        if (isCaja.status == 'No fount') return res.status(206).json(isCaja)

        const updateCierreCaja = await {
            detalle: detalle || 'No hay detalle',
            conformiadCajero: conformiadCajero,
            conformidadAdministrador: conformidadAdministrador,
            fechaCierre: Date.now(),
            fechaInicio: verifyEstadoFinanciero.result.dateCreated,
            idAdmin: idUser,
            idCajero: idCajero
        }
        try {
            await estadoFinancieroSchema.estadoFinanciero.findByIdAndUpdate({ _id: verifyEstadoFinanciero.result._id }, { state: false, cierreDeCaja: updateCierreCaja });
            const resp = await estadoFinancieroSchema.estadoFinanciero.findById({ _id: verifyEstadoFinanciero.result._id })
            const dataStadoFinanciero = await UtilsEstadoFinancier.buscarEstadoFinancieroVigente(idNegocio);
            return res.status(200).json({
                status: 'ok', message: 'Se registro el cierre de caja', result: resp, nuevoEstadoFinanciero: dataStadoFinanciero
            })
        } catch (error) {
            console.log(error);
            return res.status(400).json({ status: 'No fount', message: 'error 400', error })
        }
    }
    static async listaProductoGastos(req, res) {
        //console.log(' esto es =============================================================')
        const { idNegocio, vpn, vps, vbs } = req.params;
        const verifyNegocio = await validateNegocio(idNegocio);
        //console.log(verifyNegocio, '===== esto es verifiNegocio')
        if (verifyNegocio.status == 'No fount') return res.status(206).json(verifyNegocio);

        const getListVentas = await getListVentasTfinaciero(idNegocio);
        //console.log(getListVentas, ' =========== getListVentas')
        if (getListVentas.status == 'No fount') {
            //si no hay estado financiero activo entonces se crea uno
            await UtilsEstadoFinancier.buscarEstadoFinancieroVigente(idNegocio);
            return res.status(206).json(getListVentas);
        }

        let arrVentas = [], total = 0, sumEfectivoTotal = 0, sumCambio = 0;
        for (let i = 0; i < getListVentas.result.listVentas.length; i++) {
            total = getListVentas.result.listVentas[i].precioTotal + total;
            sumEfectivoTotal = (getListVentas.result.listVentas[i].pagoCliente * 1) + sumEfectivoTotal;
            sumCambio = (getListVentas.result.listVentas[i].cambioCliente * 1) + sumCambio;

            const user = await getNameUser(getListVentas.result.listVentas[i].idUser);
            if (user.status == 'No fount') return res.status(206).json(user)

            const cliente = await getNameCliente(getListVentas.result.listVentas[i].idCLiente);
            if (cliente.status == 'No fount') return res.status(206).json(cliente)

            const dateLocal = await converterDate(getListVentas.result.listVentas[i].dateCreate,);
            if (dateLocal.status === 'No fount') return res.status(206).json(dateLocal);

            let productoArr = [];
            for (let j = 0; j < getListVentas.result.listVentas[i].products.length; j++) {
                const datas = await getProductsItem(getListVentas.result.listVentas[i].products[j].toString());
                if (datas.status === 'No fount') return res.status(206).json(datas)
                productoArr.push(datas.result)

            }
            arrVentas.push({
                _id: getListVentas.result.listVentas[i]._id,
                idUser: `${user.resp.name} ${user.resp.lastName}`,
                idCLiente: cliente.status == 'No' ? getListVentas.result.listVentas[i].idCLiente : `${cliente.resp.name} ${cliente.resp.lastName}`,
                venta: getListVentas.result.listVentas[i].venta,
                precioTotal: getListVentas.result.listVentas[i].precioTotal,
                pagoCliente: getListVentas.result.listVentas[i].pagoCliente,
                cambioCliente: getListVentas.result.listVentas[i].cambioCliente,
                products: productoArr,
                state: getListVentas.result.listVentas[i].state,
                dateCreate: dateLocal.result?.dateLocal,
                hora: getListVentas.result.listVentas[i].dateCreate?.toString().split(' ')[4],
            })
        }

        const getListGastos = await getListGastosTfinaciero(idNegocio);
        let arr = [], totalGastos = 0;
        for (var i = 0; i < getListGastos.result.listGastos.length; i++) {
            totalGastos = totalGastos + getListGastos.result.listGastos[i].montoGasto
            const user = await getNameUser(getListGastos.result.listGastos[i].idUser);
            if (user.status == 'No fount') return res.status(206).json(user)
            let nameR = ''
            if (getListGastos.result.listGastos[i].responsableUpdate != 'none') {
                const responsable = await getNameUser(getListGastos.result.listGastos[i].responsableUpdate);
                if (responsable.status == 'No fount') return res.status(206).json(responsable)
                nameR = `${responsable.resp.name} ${responsable.resp.lastName}`
            }

            const nameTipoGasto = await validateIdTipoGasto(getListGastos.result.listGastos[i].idTipoGastos)
            if (nameTipoGasto.status == 'No fount') return res.status(206).json(nameTipoGasto)

            const dateLocal = await converterDate(getListGastos.result.listGastos[i].dateCreate);
            const dateUpdateLocal = await converterDate(getListGastos.result.listGastos[i].updateDate)
            if (dateLocal.status === 'No fount') return res.status(206).json(dateLocal);
            if (dateUpdateLocal.status === 'No fount') return res.status(206).json(dateUpdateLocal);

            arr.push({
                _id: getListGastos.result.listGastos[i]._id,
                idTipoGastos: nameTipoGasto.resp.name,
                description: getListGastos.result.listGastos[i].description,
                idUser: `${user.resp.name} ${user.resp.lastName}`,
                montoGasto: getListGastos.result.listGastos[i].montoGasto,
                isUpdate: getListGastos.result.listGastos[i].isUpdate,
                responsableUpdate: nameR,
                montoAsignadoA: getListGastos.result.listGastos[i].montoAsignadoA,
                dateCreate: dateLocal.result?.dateLocal,
                hora: getListGastos.result.listGastos[i].dateCreate?.toString().split(' ')[4],
                updateDate: dateUpdateLocal.result?.dateLocal,
                horaUpdate: getListGastos.result.listGastos[i].updateDate?.toString().split(' ')[4],

            })
        }
        if (getListGastos.status == 'No fount') return res.status(206).json(getListGastos);

        const arrListVentas = await paginationListVentas({ arrVentas, pagenumber: vpn, pagesize: vps, buscador: vbs })

        return res.status(200).json({
            status: 'ok',
            message: 'Estado financiero activo',
            result: {
                _id: getListVentas.result._id,
                montoInicial: getListVentas.result.montoInicial,
                montoCierreCaja: getListVentas.result.montoCierreCaja,
                montoActualDisponble: getListVentas.result.montoActualDisponble,
                montoTotal: getListVentas.result.montoTotal,
                montoActualUtilizado: getListVentas.result.montoActualUtilizado,
                dateCreated: getListVentas.result.dateCreated,
                cantidadVendido: getListVentas.result.listVentas.length,
                cantidadDeGastos: getListGastos.result.listGastos.length,
                ventas: {
                    sumEfectivoTotal,
                    sumCambio,
                    total,
                },
                totalGastos,
                listVentas: arrVentas,
                listGastos: arr,

                arrListVentas: arrListVentas
            }
        })
    }

    static async upateMontoInicialEstadoFinanciero(req, res) {
        const { idNegocio, idUser } = req.params;
        const { montoInicial } = req.body;
        //validamos data
        if (!montoInicial || montoInicial < 0 || isNaN(montoInicial)) return res.status(206).json({
            status: 'No fount',
            message: 'Es obligatorio poner un numero mayor a 0'
        })
        //verificamos si el negocio existe
        const verifyEstadoFinanciero = await validateEstadoFinanciero(idNegocio);
        if (verifyEstadoFinanciero.status == 'No fount') return res.status(206).json(verifyEstadoFinanciero);
        //verificamos si el que quiere cambiar el monto inicial en estado financiero es admin
        const isAdmin = await validateUserIsAdmin(idUser);
        if (isAdmin.status == 'No fount') return res.status(206).json(isAdmin)

        try {
            await estadoFinancieroSchema.estadoFinanciero.findByIdAndUpdate({ _id: verifyEstadoFinanciero.result._id }, {
                montoInicial: (montoInicial * 1) + (verifyEstadoFinanciero.result.montoInicial * 1),
                montoActualDisponble: (montoInicial * 1) + (verifyEstadoFinanciero.result.montoActualDisponble * 1)
            });

            const resp = await estadoFinancieroSchema.estadoFinanciero.findById({ _id: verifyEstadoFinanciero.result._id })
            return res.status(200).json({
                status: 'ok', message: 'Se actualizo el Monto inicial', result: resp,
            })
        } catch (error) {
            console.log(error)
            return res.status(400).json({ status: 'No fount', message: 'error 400', error })
        }
    }
    //sacar los productos vendidos por categoria del estado financiero 
    static async getPorductosCategori(req, res) {
        const { idNegocio, nameCategori } = req.params;

        const getListVentas = await getListVentasTfinaciero(idNegocio);
        //console.log(getListVentas, ' =========== getListVentas')
        if (getListVentas.status == 'No fount') return res.status(206).json(getListVentas);
        let productos = getListVentas.result.listVentas
        let arr = [];
        let sumTotal = 0;
        for (let i = 0; i < productos.length; i++) {
            let pr = await productos[i].populate('products');
            for (let j = 0; j < pr.products.length; j++) {
                if (pr.products[j].category === nameCategori) {
                    sumTotal = pr.products[j].total + sumTotal;
                    arr.push({
                        id: pr.products[j]._id,
                        nameProduct: pr.products[j].nameProduct,
                        detalleVenta: pr.products[j].detalleVenta,
                        category: pr.products[j].category,
                        precioUnitario: pr.products[j].precioUnitario,
                        total: pr.products[j].total,
                    });
                }

            }
        }
        return res.status(200).json({
            status: 'ok',
            message: 'Lista de categoria de productos dinamico',
            result: {
                sumTotal,
                length: arr.length,
                filterData: arr
            }
        })

    }

    //list de estados financieros
    static async listEstadosFinancieros(req, res) {
        const { idNegocio } = req.params;
        const verifyNegocio = await validateNegocio(idNegocio);
        if (verifyNegocio.status == 'No fount') return res.status(206).json(verifyNegocio)
        try {
            const resp = await estadoFinancieroSchema.estadoFinanciero.find({ idNegocio, state: false }).populate(['listGastos', 'listVentas']);
            let arr = []
            for (let i = 0; i < resp.length; i++) {
                const dateLocal = await converterDate(resp[i].dateCreated);
                if (dateLocal.status === 'No fount') return res.status(206).json(dateLocal);

                const dateLocalCierre = await converterDate(resp[i].cierreDeCaja.fechaCierre);
                if (dateLocalCierre.status === 'No fount') return res.status(206).json(dateLocalCierre);
                const userAdmin = await getNameUser(resp[i].cierreDeCaja.idAdmin);
                if (userAdmin.status == 'No fount') return res.status(206).json(userAdmin)
                const userRespCaja = await getNameUser(resp[i].cierreDeCaja.idCajero);
                if (userRespCaja.status == 'No fount') return res.status(206).json(userRespCaja)

                arr.push({
                    _id: resp[i]._id,
                    idNegocio: resp[i].idNegocio,
                    montoInicial: resp[i].montoInicial,
                    montoActualUtilizado: resp[i].montoActualUtilizado,
                    ventas: 0,
                    montoActualDisponble: resp[i].montoActualDisponble, // total
                    dateCreated: dateLocal.result?.dateLocal,
                    hora: dateLocal.result?.timeLocal,
                    cierreDeCaja: {
                        detalle: resp[i].cierreDeCaja.detalle,
                        fechaCierre: dateLocalCierre.result?.dateLocal,
                        horaCierre: dateLocalCierre.result?.timeLocal,
                        idAdmin: `${userAdmin.resp.name} ${userAdmin.resp.lastName}`,
                        idCajero: `${userRespCaja.resp.name} ${userRespCaja.resp.lastName}`
                    },
                    listVentas: resp[i].listVentas,
                    listGastos: resp[i].listGastos,

                })
            }
            for (let j = 0; j < arr.length; j++) {
                for (let k = 0; k < arr[j].listVentas.length; k++) {
                    arr[j].ventas = arr[j].ventas + arr[j].listVentas[k].precioTotal
                }
            }

            return res.status(200).json({
                status: 'ok',
                message: 'Lista de estados financieros del negocio',
                result: arr
            })

        } catch (error) {
            console.log(error);
            return res.status(400).json({ status: 'No fount', message: 'error 400', error })
        }
    }

    //sacar el estado finaciero activo sus ventas filtrado por usuari o todo con paginacion y busqueda de nombre
    static async getVentasEstadoFinanciero(req, res) {
        const { idNegocio, idUser, isUser, pagenumber, pagesize, buscador } = req.params;

        const verifyNegocio = await validateNegocio(idNegocio);
        if (verifyNegocio.status == 'No fount') return res.status(206).json(verifyNegocio);

        const verifyUser = await validateUser(idUser);
        if (verifyUser.status == 'No fount') return res.status(206).json(verifyUser)

        const getListVentas = await getListVentasTfinaciero(idNegocio);
        //console.log(getListVentas, ' =========== getListVentas')
        if (getListVentas.status == 'No fount') {
            //si no hay estado financiero activo entonces se crea uno
            await UtilsEstadoFinancier.buscarEstadoFinancieroVigente(idNegocio);
            return res.status(206).json(getListVentas);
        }
        let arrVentas = [], total = 0, sumEfectivoTotal = 0, sumCambio = 0;
        for (let i = 0; i < getListVentas.result.listVentas.length; i++) {
            const user = await getNameUser(getListVentas.result.listVentas[i].idUser);
            if (user.status == 'No fount') return res.status(206).json(user)

            const cliente = await getNameCliente(getListVentas.result.listVentas[i].idCLiente);
            if (cliente.status == 'No fount') return res.status(206).json(cliente)

            const dateLocal = await converterDate(getListVentas.result.listVentas[i].dateCreate,);
            if (dateLocal.status === 'No fount') return res.status(206).json(dateLocal);

            let productoArr = [];
            for (let j = 0; j < getListVentas.result.listVentas[i].products.length; j++) {
                const datas = await getProductsItem(getListVentas.result.listVentas[i].products[j].toString());
                if (datas.status === 'No fount') return res.status(206).json(datas)
                productoArr.push(datas.result)

            }
            if (isUser == 'true') {
                if (getListVentas.result.listVentas[i].idUser === idUser) {
                    total = getListVentas.result.listVentas[i].precioTotal + total;
                    sumEfectivoTotal = (getListVentas.result.listVentas[i].pagoCliente * 1) + sumEfectivoTotal;
                    sumCambio = (getListVentas.result.listVentas[i].cambioCliente * 1) + sumCambio;
                    arrVentas.push({
                        _id: getListVentas.result.listVentas[i]._id,
                        idUser: `${user.resp.name} ${user.resp.lastName}`,
                        idCLiente: cliente.status == 'No' ? getListVentas.result.listVentas[i].idCLiente : `${cliente.resp.name} ${cliente.resp.lastName}`,
                        venta: getListVentas.result.listVentas[i].venta,
                        precioTotal: getListVentas.result.listVentas[i].precioTotal,
                        pagoCliente: getListVentas.result.listVentas[i].pagoCliente,
                        cambioCliente: getListVentas.result.listVentas[i].cambioCliente,
                        products: productoArr,
                        state: getListVentas.result.listVentas[i].state,
                        dateCreate: dateLocal.result?.dateLocal,
                        hora: getListVentas.result.listVentas[i].dateCreate?.toString().split(' ')[4],
                    })
                }
            } else {
                total = getListVentas.result.listVentas[i].precioTotal + total;
                sumEfectivoTotal = (getListVentas.result.listVentas[i].pagoCliente * 1) + sumEfectivoTotal;
                sumCambio = (getListVentas.result.listVentas[i].cambioCliente * 1) + sumCambio;
                arrVentas.push({
                    _id: getListVentas.result.listVentas[i]._id,
                    idUser: `${user.resp.name} ${user.resp.lastName}`,
                    idCLiente: cliente.status == 'No' ? getListVentas.result.listVentas[i].idCLiente : `${cliente.resp.name} ${cliente.resp.lastName}`,
                    venta: getListVentas.result.listVentas[i].venta,
                    precioTotal: getListVentas.result.listVentas[i].precioTotal,
                    pagoCliente: getListVentas.result.listVentas[i].pagoCliente,
                    cambioCliente: getListVentas.result.listVentas[i].cambioCliente,
                    products: productoArr,
                    state: getListVentas.result.listVentas[i].state,
                    dateCreate: dateLocal.result?.dateLocal,
                    hora: getListVentas.result.listVentas[i].dateCreate?.toString().split(' ')[4],
                })
            }
        }

        const arrListVentas = await paginationListVentas({ arrVentas, pagenumber, pagesize, buscador })

        return res.status(200).json({
            status: 'ok',
            message: 'Lista de ventas del estado financiero',
            result: {
                ventas: {
                    sumEfectivoTotal,
                    sumCambio,
                    total,
                },
                listVentas: arrListVentas,
            }
        })
    }
    //sacar los gaastos del estado financiero activo filtrado tmb por user
    static async getGastosEstadoFinacieroActivo(req, res) {
        const { idNegocio, idUser, isUser, pagenumber, pagesize, buscador } = req.params;
        console.log(pagenumber, pagesize, buscador, ' sdfjlskdjf')
        const verifyNegocio = await validateNegocio(idNegocio);
        if (verifyNegocio.status == 'No fount') return res.status(206).json(verifyNegocio);

        const verifyUser = await validateUser(idUser);
        if (verifyUser.status == 'No fount') return res.status(206).json(verifyUser)

        const getListGastos = await getListGastosTfinaciero(idNegocio);
        if (getListGastos.status == 'No fount') {
            //si no hay estado financiero activo entonces se crea uno
            await UtilsEstadoFinancier.buscarEstadoFinancieroVigente(idNegocio);
            return res.status(206).json(getListGastos);
        }

        let arr = [], totalGastos = 0;
        for (var i = 0; i < getListGastos.result.listGastos.length; i++) {

            const user = await getNameUser(getListGastos.result.listGastos[i].idUser);
            if (user.status == 'No fount') return res.status(206).json(user)
            let nameR = ''
            if (getListGastos.result.listGastos[i].responsableUpdate != 'none') {
                const responsable = await getNameUser(getListGastos.result.listGastos[i].responsableUpdate);
                if (responsable.status == 'No fount') return res.status(206).json(responsable)
                nameR = `${responsable.resp.name} ${responsable.resp.lastName}`
            }

            const nameTipoGasto = await validateIdTipoGasto(getListGastos.result.listGastos[i].idTipoGastos)
            if (nameTipoGasto.status == 'No fount') return res.status(206).json(nameTipoGasto)

            const dateLocal = await converterDate(getListGastos.result.listGastos[i].dateCreate);
            const dateUpdateLocal = await converterDate(getListGastos.result.listGastos[i].updateDate)
            if (dateLocal.status === 'No fount') return res.status(206).json(dateLocal);
            if (dateUpdateLocal.status === 'No fount') return res.status(206).json(dateUpdateLocal);
            console.log(getListGastos.result.listGastos[i].idUser, '===', idUser, ' ===-=-=- cccc')
            if (isUser == 'true') {
                if (getListGastos.result.listGastos[i].idUser == idUser) {
                    totalGastos = totalGastos + getListGastos.result.listGastos[i].montoGasto
                    arr.push({
                        _id: getListGastos.result.listGastos[i]._id,
                        idTipoGastos: nameTipoGasto.resp.name,
                        description: getListGastos.result.listGastos[i].description,
                        idUser: `${user.resp.name} ${user.resp.lastName}`,
                        montoGasto: getListGastos.result.listGastos[i].montoGasto,
                        isUpdate: getListGastos.result.listGastos[i].isUpdate,
                        responsableUpdate: nameR,
                        montoAsignadoA: getListGastos.result.listGastos[i].montoAsignadoA,
                        dateCreate: dateLocal.result?.dateLocal,
                        hora: getListGastos.result.listGastos[i].dateCreate?.toString().split(' ')[4],
                        updateDate: dateUpdateLocal.result?.dateLocal,
                        horaUpdate: getListGastos.result.listGastos[i].updateDate?.toString().split(' ')[4],

                    })
                }

            } else {
                totalGastos = totalGastos + getListGastos.result.listGastos[i].montoGasto
                arr.push({
                    _id: getListGastos.result.listGastos[i]._id,
                    idTipoGastos: nameTipoGasto.resp.name,
                    description: getListGastos.result.listGastos[i].description,
                    idUser: `${user.resp.name} ${user.resp.lastName}`,
                    montoGasto: getListGastos.result.listGastos[i].montoGasto,
                    isUpdate: getListGastos.result.listGastos[i].isUpdate,
                    responsableUpdate: nameR,
                    montoAsignadoA: getListGastos.result.listGastos[i].montoAsignadoA,
                    dateCreate: dateLocal.result?.dateLocal,
                    hora: getListGastos.result.listGastos[i].dateCreate?.toString().split(' ')[4],
                    updateDate: dateUpdateLocal.result?.dateLocal,
                    horaUpdate: getListGastos.result.listGastos[i].updateDate?.toString().split(' ')[4],

                })
            }

        }
        /* console.log(arr, ' --------------------------------') */
        const arrListVentas = await paginationListGastos({ arrGastos:arr, pagenumber, pagesize, buscador })

        return res.status(200).json({
            status: 'ok',
            message: 'Lista de gastos del estado financiero',
            result: {
                totalGastos,
                listGastos: arrListVentas,
            }
        })
    }


}
//validamos los datos requiridos
async function validateDatas(conformiadCajero, detalle, conformidadAdministrador, idCajero) {
    if (!conformiadCajero) return { status: 'No fount', message: 'Verifique si el cajero esta conforme' };
    if (!detalle) return { status: 'No fount', message: 'Detalle es obligatorio' };
    if (!conformidadAdministrador) return { status: 'No fount', message: 'No se esta mando la conformidad del usuario administrador' };
    if (!idCajero) return { status: 'No fount', message: 'Inserte nombre del cajero' };
    return { status: 'ok', message: 'continuar' }

}
//verificamos si es admin
async function validateUserIsAdmin(idAdminUser) {
    try {
        const resp = await user.findById({ _id: idAdminUser }).populate('role');
        if (!resp) return { status: 'No fount', message: 'Ese usuario no existe' };
        let isAdmin = false
        for (var i = 0; i < resp.role.length; i++) {
            if (resp.role[i].name == 'admin') {
                isAdmin = true;
            }
        }
        if (!isAdmin) return { status: 'No fount', message: 'Ese usuario no es admin' }
        return { status: 'ok', message: 'Ese usuario es admin' }
    } catch (error) {
        console.log(error);
        return { status: 'No fount', message: 'error 400', error }
    }
}
//verificamos si es cajero
async function validateUserIsCajero(isCajero) {
    try {
        const resp = await user.findById({ _id: isCajero }).populate('role');
        if (!resp) return { status: 'No fount', message: 'Ese usuario no existe' };
        let isAdmin = false
        for (var i = 0; i < resp.role.length; i++) {
            if (resp.role[i].name == 'caja' || resp.role[i].name == 'admin') {
                isAdmin = true;
            }
        }
        if (!isAdmin) return { status: 'No fount', message: 'Ese usuario no es cajero' }
        return { status: 'ok', message: 'Ese usuario es cajero' }
    } catch (error) {
        console.log(error);
        return { status: 'No fount', message: 'error 400', error }
    }
}
//validar usuario 
async function validateUser(idUser) {
    try {
        const resp = await user.findById({ _id: idUser });
        if (!resp) return { status: 'No fount', message: 'Ese usuario no existe' };
        return { status: 'ok', message: 'si existe' }
    } catch (error) {
        console.log(error);
        return { status: 'No fount', message: 'error 400', error }
    }
}
//verificamos is el negocio existe
async function validateNegocio(idNegocio) {
    try {
        const resp = await negocio.findById({ _id: idNegocio });
        if (!resp) return { status: 'No fount', message: 'Ese negocio no existe' };
        return { status: 'ok', message: 'Ese negocio existe' }
    } catch (error) {
        console.log(error);
        return { status: 'No fount', message: 'error 400', error }
    }
}

//verificamos si hay estado finaciero activo
async function validateEstadoFinanciero(idNegocio) {
    try {
        const resp = await estadoFinancieroSchema.estadoFinanciero.findOne({ idNegocio, state: true });
        if (!resp) return { status: 'No fount', message: 'No hay estado financiero activo' };
        return { status: 'ok', message: 'Estado financiero activo', result: resp }
    } catch (error) {
        console.log(error);
        return { status: 'No fount', message: 'error 400', error }
    }
}
async function getListVentasTfinaciero(idNegocio) {
    try {
        const resp = await estadoFinancieroSchema.estadoFinanciero.findOne({ idNegocio, state: true }).populate(['listVentas']);
        if (!resp) return { status: 'No fount', message: 'No hay estado financiero activo' };
        return { status: 'ok', message: 'Estado financiero activo', result: resp }
    } catch (error) {
        console.log(error);
        return { status: 'No fount', message: 'error 400', error }
    }
}
async function getListGastosTfinaciero(idNegocio) {
    try {
        const resp = await estadoFinancieroSchema.estadoFinanciero.findOne({ idNegocio, state: true }).populate('listGastos');
        if (!resp) return { status: 'No fount', message: 'No hay estado financiero activo' };
        return { status: 'ok', message: 'Estado financiero activo', result: resp }
    } catch (error) {
        console.log(error);
        return { status: 'No fount', message: 'error 400', error }
    }
}
async function getNameUser(idUSer) {
    try {
        const resp = await user.findOne({ _id: idUSer })

        if (!resp) return { status: 'No fount', message: 'Ese usuario no existe' }
        return { status: 'ok', message: 'usuario si existe', resp }
    } catch (error) {
        console.log(error);
        return { status: 'No fount', message: 'Ese usuario no existe' }
    }
}
async function getNameCliente(idCliente) {
    try {
        const resp = await cliente.findOne({ _id: idCliente })
        if (!resp) return { status: 'No fount', message: 'Cliente No existe' }
        return { status: 'ok', message: 'existe', resp }
    } catch (error) {
        return { status: 'No', message: 'Publico general' }
    }
}

async function validateIdTipoGasto(idTIpoGasto) {
    try {
        const resp = await tipoGastos.findOne({ _id: idTIpoGasto });
        if (!resp) return { status: 'No fount', message: 'No se puede mostrar por que ese tipo de gastos no fue registrado' }
        return { status: 'ok', message: 'existe', resp }
    } catch (error) {
        console.error(error);
        return { status: 'No fount', message: 'erro 400' }
    }
}
async function converterDate(date) {
    try {
        let dateLocal = new Date(date).toLocaleString().split(' ')[0]
        let timeLocal = new Date(date).toLocaleString().split(' ')[1]
        return {
            status: 'ok',
            result: {
                dateLocal,
                timeLocal
            }
        }
    } catch (error) {
        console.log(error);
        return { status: 'No fount', message: 'Error al canvertir las fechas a la hora local' }
    }
}
async function getProductsItem(idProduct) {
    try {
        const resp = await pvendido.findById({ _id: idProduct });

        if (!resp) return { status: 'No fount', message: "Error al buscar el producto" }
        return { status: 'ok', message: 'si existe producto', result: resp }
    } catch (error) {
        console.log(error);
        return { status: 'No fount', message: 'Error 400' }
    }
}
//paginas y busqueda de datos de list ventas del estado financiero
async function paginationListVentas({ arrVentas = [], pagenumber = 0, pagesize = 4, buscador = '' }) {
    console.log(arrVentas, ' 0---0-0000---')
    const filtrar = arrVentas.filter((item) => {
        return item.idUser.toLowerCase().includes(buscador.toLowerCase()) ||
            item.idCLiente.toLowerCase().includes(buscador.toLowerCase()) ||
            item.hora.toLowerCase().includes(buscador.toLowerCase())
    })
    var pageNumber = (pagenumber * 1) || 0;//numero de pagina
    var pageSize = (pagesize * 1) || 4;//tamanio de pagiancion
    var pageCount = Math.ceil(filtrar.length / pageSize);
    let pag = filtrar.slice(pageNumber * pageSize, (pageNumber + 1) * pageSize);  

    return { result: pag, pageCount, pageNumber }

}
//paginas y busqueda de datos de list gastos del estado financiero
async function paginationListGastos({ arrGastos = [], pagenumber = 0, pagesize = 4, buscador = '' }) {
    const filtrar = arrGastos.filter((item) => {
        return item.idUser.toLowerCase().includes(buscador.toLowerCase()) ||            
            item.hora.toLowerCase().includes(buscador.toLowerCase())||
            item.montoAsignadoA.toLowerCase().includes(buscador.toLowerCase())||
            item.idTipoGastos.toLowerCase().includes(buscador.toLowerCase())
    })
    var pageNumber = (pagenumber * 1) || 0;//numero de pagina
    var pageSize = (pagesize * 1) || 4;//tamanio de pagiancion
    var pageCount = Math.ceil(filtrar.length / pageSize);
    let pag = filtrar.slice(pageNumber * pageSize, (pageNumber + 1) * pageSize);
    console.log(pag.length, '================================================================pag')
    console.log(pageCount, '================================================================pageCount')
    console.log(pageNumber, '================================================================pageNumber')

    return { result: pag, pageCount, pageNumber }

}
module.exports = EstadoFinanciero;