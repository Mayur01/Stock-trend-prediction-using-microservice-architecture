FROM python:3

WORKDIR /usr/scr/prediction

COPY requirements.txt ./

RUN pip install -r requirements.txt

COPY . .

CMD [ "python", "./stock.py" ]

EXPOSE 5050