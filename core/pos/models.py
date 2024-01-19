from datetime import datetime

from django.db import models
from django.db.models import Sum, F, FloatField
from django.db.models.functions import Coalesce
from django.forms import model_to_dict

from config import settings
from core.pos.choices import genders


# Estado de Ventas
class EstadoVenta:
    presupuestada = 'Presupuestada'
    pendiente_colocacion = 'Preciente de Colocacion'
    terminada = 'Colocacion Terminada'


ESTADO_VENTA = (
    (EstadoVenta.presupuestada, "Presupuestada"),
    (EstadoVenta.pendiente_colocacion, "Costo Transporte"),
    (EstadoVenta.terminada, "Costo Colocación"),
    (EstadoVenta.terminada, "Otros Costos"),
    )

# Descripción de Atributos
class DescripcionAtributo:
    costo_proveedor = 'Costo proveedor'
    costo_transporte = 'Costo transporte'
    costo_colocacion = 'Costo colocación'
    otros_costos = 'Otros Costos'


DESCRIPCION_ATRIBUTO = (
    (DescripcionAtributo.costo_proveedor, "Costo proveedor"),
    (DescripcionAtributo.costo_transporte, "Costo transporte"),
    (DescripcionAtributo.costo_colocacion, "Costo colocación"),
    (DescripcionAtributo.otros_costos, "Otros costos"),
    )


class Category(models.Model):
    name = models.CharField(max_length=150, verbose_name='Nombre', unique=True)
    desc = models.CharField(max_length=500, null=True, blank=True, verbose_name='Descripción')

    def __str__(self):
        return self.name

    def toJSON(self):
        item = model_to_dict(self)
        return item

    class Meta:
        verbose_name = 'Categoria'
        verbose_name_plural = 'Categorias'
        ordering = ['id']


class Product(models.Model):
    name = models.CharField(max_length=150, verbose_name='Nombre', unique=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, verbose_name='Categoría')
    image = models.ImageField(upload_to='product/%Y/%m/%d', null=True, blank=True, verbose_name='Imagen')

    def __str__(self):
        return f'{self.name} ({self.category.name})'

    def toJSON(self):
        item = model_to_dict(self)
        item['full_name'] = self.__str__()
        item['category'] = self.category.toJSON()
        item['image'] = self.get_image()
        item['atributos'] = [i.toJSON() for i in self.atributos_set.all()]
        return item

    def get_image(self):
        if self.image:
            return f'{settings.MEDIA_URL}{self.image}'
        return f'{settings.STATIC_URL}img/empty.png'

    class Meta:
        verbose_name = 'Producto'
        verbose_name_plural = 'Productos'
        ordering = ['id']


class Atributos(models.Model):
    producto = models.ForeignKey(Product, on_delete=models.CASCADE, verbose_name='Producto')
    atributo = models.CharField(u'Atriburo', max_length=60, choices=DESCRIPCION_ATRIBUTO)
    costo = models.DecimalField(default=0.00, max_digits=10, decimal_places=2, verbose_name='Costo')

    def toJSON(self):
        item = model_to_dict(self)
        item['costo'] = f'{self.costo:.2f}'
        return item

    class Meta:
        unique_together = ('producto', 'atributo')
        verbose_name = 'Atributo'
        verbose_name_plural = 'Atributos'
        ordering = ['id']


class Client(models.Model):
    names = models.CharField(max_length=150, verbose_name='Nombres')
    address = models.CharField(max_length=150, null=True, blank=True, verbose_name='Dirección')
    telefono = models.CharField(max_length=25, null=True, blank=True, verbose_name='Telefono')
    contacto = models.CharField(max_length=25, null=True, blank=True, verbose_name='Contacto')

    def __str__(self):
        return self.get_full_name()

    def get_full_name(self):
        return f'{self.names}'

    def toJSON(self):
        item = model_to_dict(self)
        item['full_name'] = self.get_full_name()
        return item

    class Meta:
        verbose_name = 'Cliente'
        verbose_name_plural = 'Clientes'
        ordering = ['id']


class Company(models.Model):
    name = models.CharField(max_length=150, verbose_name='Razón Social')
    address = models.CharField(max_length=150, null=True, blank=True, verbose_name='Dirección')
    mobile = models.CharField(max_length=10, verbose_name='Teléfono Celular')
    phone = models.CharField(max_length=7, verbose_name='Teléfono Alternativo', blank=True, null=True)
    image = models.ImageField(upload_to='company/%Y/%m/%d', null=True, blank=True, verbose_name='Imagen')

    def __str__(self):
        return self.name

    def get_image(self):
        if self.image:
            return f'{settings.MEDIA_URL}{self.image}'
        return f'{settings.STATIC_URL}img/empty.png'

    def toJSON(self):
        item = model_to_dict(self)
        item['image'] = self.get_image()
        return item

    class Meta:
        verbose_name = 'Compañia'
        verbose_name_plural = 'Compañias'
        default_permissions = ()
        permissions = (
            ('change_company', 'Can change Company'),
        )
        ordering = ['id']


class Sale(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, null=True, blank=True)
    client = models.ForeignKey(Client, on_delete=models.CASCADE)
    date_joined = models.DateField(default=datetime.now)
    subtotal = models.DecimalField(default=0.00, max_digits=9, decimal_places=2)
    iva = models.DecimalField(default=0.00, max_digits=9, decimal_places=2)
    total_iva = models.DecimalField(default=0.00, max_digits=9, decimal_places=2)
    total = models.DecimalField(default=0.00, max_digits=9, decimal_places=2)
    estado = models.CharField(u'Estado Venta', max_length=60, choices=ESTADO_VENTA,
                              default=EstadoVenta.presupuestada)

    def __str__(self):
        return self.client.names

    def save(self, force_insert=False, force_update=False, using=None,
             update_fields=None):
        if Company.objects.all().exists():
            self.company = Company.objects.first()
        super(Sale, self).save()

    def get_number(self):
        return f'{self.id:06d}'

    def toJSON(self):
        item = model_to_dict(self)
        item['number'] = self.get_number()
        item['client'] = self.client.toJSON()
        item['subtotal'] = f'{self.subtotal:.2f}'
        item['iva'] = f'{self.iva:.2f}'
        item['total_iva'] = f'{self.total_iva:.2f}'
        item['total'] = f'{self.total:.2f}'
        item['date_joined'] = self.date_joined.strftime('%Y-%m-%d')
        item['saleproduct'] = [i.toJSON() for i in self.saleproduct_set.all()]
        return item

    class Meta:
        verbose_name = 'Venta'
        verbose_name_plural = 'Ventas'
        ordering = ['id']


class SaleProduct(models.Model):
    sale = models.ForeignKey(Sale, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    price = models.DecimalField(default=0.00, max_digits=10, decimal_places=2)
    cant = models.IntegerField(default=0)
    subtotal = models.DecimalField(default=0.00, max_digits=10, decimal_places=2)
    observaciones = models.TextField(max_length=250, verbose_name='Observaciones', blank=True, null=True)

    def __str__(self):
        return self.product.name

    def toJSON(self):
        item = model_to_dict(self, exclude=['sale'])
        item['product'] = self.product.toJSON()
        item['price'] = f'{self.price:.2f}'
        item['subtotal'] = f'{self.subtotal:.2f}'
        return item

    class Meta:
        verbose_name = 'Detalle de Venta'
        verbose_name_plural = 'Detalle de Ventas'
        default_permissions = ()
        ordering = ['id']
